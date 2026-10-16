// * ARCHIVO A COMPLETAR
import { body } from "express-validator";
import { UserModel, ProfileModel } from "../../models/index.js";

// ✿ solo letras
const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

export const registerValidation = [
  // TODO: 1. Validar username: obligatorio, entre 3 y 20 caracteres y único (UserModel).
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El username es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo puede contener letras y números")
    .custom(async (username) => {
      // ✿ validacion para que no se repita el user
      const found = await UserModel.findOne({
        where: { username },
        paranoid: false, // ✿ para buscar entre los usuarios eliminados tambien
      });
      if (found) throw new Error("El username ya está en uso");
      return true;
    }),

  // TODO: 2. Validar email: obligatorio, con formato válido y único.
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    // ✿ validacion para que no se repita el email
    .custom(async (email) => {
      const found = await UserModel.findOne({
        where: { email },
        paranoid: false,
      });
      if (found) throw new Error("El email ya está registrado");
      return true;
    }),

  // TODO: 3. Validar password: obligatoria, con mínimo de 8 caracteres.
  body("password")
    .notEmpty()
    .withMessage("La password es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La password debe tener al menos 8 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La password debe tener al menos una mayúscula")
    .matches(/[a-z]/)
    .withMessage("La password debe tener al menos una minúscula")
    .matches(/[0-9]/)
    .withMessage("La password debe tener al menos un número"),

  // TODO: 4. Validar role: opcional y limitado a los roles permitidos.
  body("role")
    .optional()
    .isIn(["developer", "administrator"])
    .withMessage("El role debe ser developer o administrator"),

  // TODO: 5. Validar profile.employee_number: obligatorio y único (ProfileModel).
  // ✿ verifica que llegue el objeto
  body("profile").isObject().withMessage("El profile es obligatorio"),
  // ✿ profile.campo permite validar los campos dentro de profile
  body("profile.employee_number")
    .trim()
    .notEmpty()
    .withMessage("El numero de empleado es obligatorio")
    .matches(/^[A-Za-z0-9-]{3,20}$/)
    .withMessage(
      "El numero de empleado solo admite letras, números y guiones (3 a 20)",
    )
    .custom(async (employee_number) => {
      const found = await ProfileModel.findOne({ where: { employee_number } });
      if (found) throw new Error("El numero de empleado ya existe");
      return true;
    }),

  // TODO: 6. Validar profile.first_name y profile.last_name como obligatorios, y profile.phone como opcional.
  // ? Las unicidades requieren una validación personalizada asíncrona.
  body("profile.first_name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(soloLetras)
    .withMessage("El nombre solo puede contener letras"),
  body("profile.last_name")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres")
    .matches(soloLetras)
    .withMessage("El apellido solo puede contener letras"),
  body("profile.phone")
    .optional()
    .matches(/^\+?[0-9\s-]{7,20}$/)
    .withMessage("El phone no tiene un formato válido"),
];

export const loginValidation = [
  // TODO: 7. Validar email: obligatorio y con formato válido.
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato válido"),
  // TODO: 8. Validar password: obligatoria.
  body("password")
    .notEmpty()
    .withMessage("La password es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La password debe tener al menos 8 caracteres"),
];
