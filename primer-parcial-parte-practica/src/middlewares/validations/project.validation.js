// * ARCHIVO A COMPLETAR
import { body } from "express-validator";
import {
  ProjectModel,
  TechnologyModel,
  UserModel,
} from "../../models/index.js";

// ✿ validaciones reutilizables:
// ✿ 1. formato:
const codeFormat = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
// ✿ 2. existencia del lider
const leaderExists = async (leader_id) => {
  const user = await UserModel.findByPk(leader_id);
  if (!user) throw new Error("El lider no existe o fue eliminado");
  return true;
};
// ✿ 2. existencia de la tecnologia
const technologiesExist = async (technologies) => {
  const ids = [...new Set(technologies)]; // set elimina los ids repetidos
  const count = await TechnologyModel.count({ where: { id: ids } });
  if (count !== ids.length) {
    throw new Error("Alguna de las tecnologias no existen");
  }
  return true;
};

export const createProjectValidation = [
  // TODO: 1. Validar code: obligatorio y único (ProjectModel).
  body("code")
    .trim()
    .notEmpty()
    .withMessage("El codigo es obligatorio")
    .matches(codeFormat)
    .withMessage("El codigo solo admite mayusculas, numeros y guiones")
    // ✿ validacion para la existencia del codigo
    .custom(async (code) => {
      const found = await ProjectModel.findOne({ where: { code } });
      if (found) throw new Error("El codigo ya existe");
    }),

  // TODO: 2. Validar name y description como obligatorios.
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("La descripcion es obligatoria")
    .isLength({ min: 10, max: 500 })
    .withMessage("La descripcion debe tener entre 10 y 500 caracteres"),

  // TODO: 3. Validar status: opcional y limitado a los estados permitidos.
  body("status")
    .optional()
    .isIn(["planning", "in_progress", "paused", "finished"])
    .withMessage("El estado debe ser planning, in_progress, paused o finished"),

  // TODO: 4. Validar start_date como fecha válida y budget como número positivo, ambos obligatorios.
  body("start_date")
    .notEmpty()
    .withMessage("La fecha es obligatoria")
    // ✿ commprueba que sea fecha con ese formato
    // ✿ con strict: true verifica que la fecha exista en el calendario
    .isISO8601({ strict: true })
    .withMessage("La fecha debe ser una fecha válida (AAAA-MM-DD)"),
  body("budget")
    .notEmpty()
    .withMessage("El presupuesto es obligatorio")
    // ✿ gt - greater than(mayor que)
    .isFloat({ gt: 0 })
    .withMessage("El presupuesto debe ser un número positivo"),

  // TODO: 5. Validar leader_id: debe existir y pertenecer a un usuario activo (UserModel).
    // ✿ opcional porque ya se crea el lider al crear el usuario
    body("leader_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El id del lider debe ser un entero positivo")
    .bail() // ✿ si no es un entero no consulta a la bd
    .custom(leaderExists),

  // TODO: 6. Validar technologies: lista de ids que existan (TechnologyModel).
  // ? Un usuario eliminado lógicamente no puede ser líder: comprobar que la búsqueda lo deje afuera.
  body("technologies")
    .optional()
    .isArray()
    .withMessage("Las tecnologias deben enviarse como un array de ids")
    .bail()
    .custom(technologiesExist),
  // ✿ "technologies.*" aplica la regla a cada elemento del array
  body("technologies.*")
    .isInt({ min: 1 })
    .withMessage("Cada tecnologias debe ser un id entero positivo"),
];

export const updateProjectValidation = [
  // TODO: 7. Validar code como opcional y único, excluyendo el propio proyecto que se edita.
  body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El codigo no puede estar vacío")
    .matches(codeFormat)
    .withMessage("El codigo solo admite mayúsculas, números y guiones")
    .custom(async (code, { req }) => {
      // ✿ El id del proyecto que se edita viene en la ruta: req.params.id.
      // ✿ Op.ne = "distinto de": así el proyecto puede conservar su propio code.
      const found = await ProjectModel.findOne({
        where: { code, id: { [Op.ne]: req.params.id } },
      });
      if (found) throw new Error("El codigo ya existe");
      return true;
    }),

  // TODO: 8. Validar name y description como opcionales y no vacíos.
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La descripcion no puede estar vacía")
    .isLength({ min: 10, max: 500 })
    .withMessage("La descripcion debe tener entre 10 y 500 caracteres"),

  // TODO: 9. Validar status, start_date y budget como opcionales, con las mismas reglas que al crear.
   body("status")
    .optional()
    .isIn(["planning", "in_progress", "paused", "finished"])
    .withMessage("El estado debe ser planning, in_progress, paused o finished"),
  body("start_date")
    .optional()
    .isISO8601({ strict: true })
    .withMessage("La fecha debe ser una fecha válida (AAAA-MM-DD)"),
  body("budget")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("El presupuesto debe ser un número positivo"),

  // TODO: 10. Validar leader_id como opcional, existente y de un usuario activo.
  body("leader_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El id del lider debe ser un entero positivo")
    .bail()
    .custom(leaderExists),
  // TODO: 11. Validar technologies como opcional, con ids que existan.
  body("technologies")
    .optional()
    .isArray()
    .withMessage("Las tecnologias deben enviarse como un array de ids")
    .bail()
    .custom(technologiesExist),
  body("technologies.*")
    .isInt({ min: 1 })
    .withMessage("Cada tecnologias debe ser un id entero positivo"),
  // ? Para saber qué proyecto se edita, el id se obtiene de los parámetros de la ruta (req.params).
];
