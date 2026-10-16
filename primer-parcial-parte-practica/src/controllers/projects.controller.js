// * ARCHIVO A COMPLETAR
import {
  ProjectModel,
  ProjectTechnologyModel,
  TechnologyModel,
  UserModel,
} from "../models/index.js";

// ★ los include se repiten entonces por eso se definen una sola vez, 'as' tiene que coincidir con los alias definidos en models/index.js

const leaderInclude = {
  model: UserModel,
  as: "leader",
  attributes: {
    exclude: ["password"],
  },
};
const technologiesInclude = { model: TechnologyModel, as: "technologies" };

export const createProject = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      status,
      start_date,
      budget,
      technologies,
    } = req.body;

    // TODO: 1. Crear el project con los datos del body que ya pasaron la validación.
    const project = await ProjectModel.create({
      code,
      name,
      description,
      status,
      start_date,
      budget,
      leader_id: req.user.id,
    });

    // ? Revisar de dónde debe salir el leader del proyecto.
    // TODO: 2. Asociar al project las technologies recibidas.
    // ★ setTechnologies guarda las filas en la tabla intermedia
    if (technologies) {
      await project.setTechnologies(technologies);
    }
    // TODO: 3. Responder con código 201 y el project con sus technologies y su leader.
    // ★ se vuelve a buscar el project para poder traerlo con los include
    const createdProject = await ProjectModel.findByPk(project.id, {
      include: [leaderInclude, technologiesInclude],
    });
    return res.status(201).json({ data: createProject });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getAllProjects = async (_req, res) => {
  try {
    // TODO: 1. Listar todos los projects incluyendo su leader (sin la password) y sus technologies, y responder con código 200 y los projects..
    const projects = await ProjectModel.findAll({
      include: [leaderInclude, technologiesInclude],
    });
    return res.status(200).json({ data: projects });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    // TODO: 1. Listar los projects cuyo leader sea el usuario logueado, incluyendo sus technologies, y responder con código 200 y los projects.
    const projects = await ProjectModel.findAll({
      where: { leader_id: req.user.id },
      include: [technologiesInclude],
    });
    return res.status(200).json({ data: projects });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const updateProject = async (req, res) => {
  try {
    // ★ verificación de existencia
    const project = await ProjectModel.findByPk(req.params.id);
    if (!project)
      return res.status(404).json({ msg: "Proyecto no encontrado" });

    const {
      code,
      name,
      description,
      status,
      start_date,
      budget,
      leader_id,
      technologies,
    } = req.body;

    // TODO: 1. Actualizar el project con los datos recibidos.
    // ★ los campos que no vienen quedan undefined y sequelize los ignora
    await project.update({
      code,
      name,
      description,
      status,
      start_date,
      budget,
      leader_id,
    });
    // TODO: 2. Reemplazar sus technologies si vienen en el body.
    if (technologies) {
      await project.setTechnologies(technologies);
    }
    // TODO: 3. Responder con código 200 y el project actualizado, incluyendo su leader y sus technologies.
    const updatedProject = await ProjectModel.findByPk(project.id, {
      include: [leaderInclude, technologiesInclude],
    });
    return res.status(200).json({ data: updatedProject });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await ProjectModel.findByPk(req.params.id);
    if (!project)
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    // TODO: 1. Eliminar el project y responder con código 204 sin devolver ningún mensaje.
    await project.destroy();
    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};
