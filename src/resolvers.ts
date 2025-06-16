//Aqui nos conectamos con el cliente de prisma, definimos nuestros resolvers que usara apollo server para realizar las consultas

import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}

export const resolvers = {
  Query: {
    getTasksByUserId: async (
      parent: any,
      args: { userId: string },
      context: Context
    ) => {
      return await context.prisma.task.findMany({
        where: { userId: args.userId },
        include: { status: true, user: true },
        orderBy: {
          createdAt: "desc",
        },
      });
    },

    getTaskStatusesByUserId: async (
      parent: any,
      args: { userId: string },
      context: Context
    ) => {
      return await context.prisma.taskStatus.findMany({
        where: { userId: args.userId },
        include: { tasks: true },
        orderBy: { position: "asc" },
      });
    },
    getTaskById: async (
      parent: any,
      args: { id: string },
      context: Context
    ) => {
      return await context.prisma.task.findUnique({
        where: { id: args.id },
        include: { status: true, user: true },
      });
    },
  },

  Mutation: {
    createTask: async (parent: any, args: { input: any }, context: Context) => {
      const { title, description, userId, statusId } = args.input;

      return await context.prisma.task.create({
        data: { title, description, userId, statusId },
        include: { status: true },
      });
    },
    createTaskStatus: async (
      parent: any,
      args: { input: any },
      context: Context
    ) => {
      const { name, userId } = args.input;
      //Contando el numero de status por usuario
      const countStatusByUserId = await context.prisma.taskStatus.count({
        where: { userId: userId },
      });
      if (countStatusByUserId >= 5) {
        throw new Error("Solo puedes tener 5 status");
      }
      const newposition = countStatusByUserId + 1;
      return await context.prisma.taskStatus.create({
        data: {
          name: name,
          isDefault: false,
          position: newposition,
          userId: userId,
        },
        include: {},
      });
    },

    updateTaskStatus: async (
      parent: any,
      args: { input: any },
      context: Context
    ) => {
      const { id, name, position, userId } = args.input;
      const dataToUpdate: { name?: string; position?: number } = {};
      const taskStatusToUpdate = await context.prisma.taskStatus.findUnique({
        where: { id: id },
      });

      if (taskStatusToUpdate?.userId != userId) {
        throw new Error(
          "No tienes permitido editar este statusss :((  verificacion "
        );
      }

      if (position <= 0 || position > 5) {
        return new Error("La posicion tiene que estar en el rango entre 1 y 5");
      }
      if (taskStatusToUpdate?.isDefault == true) {
        if (name !== undefined && name !== null) {
          throw new Error(
            "No se puede modificar el name de las columnas default :?."
          );
        }
        dataToUpdate.position = position;
      } else {
        dataToUpdate.name = name;
        dataToUpdate.position = position;
      }

      return await context.prisma.taskStatus.update({
        where: { id: id },
        data: dataToUpdate,
      });
    },
    //Mandamos el userId en el body para actualizar tarea
    updateTask: async (
      parent: any,
      args: {
        input: {
          id: string,
          title?: string,
          description?: string,
          statusId?: string,
          userId?: string,
        };
      },
      context: Context
    ) => {
      const { id, title, description, statusId, userId } = args.input;
      const taskToUpdate = await context.prisma.task.findUnique({
        where: { id: id },
      });

      if (!taskToUpdate) {
        throw new Error("Tarea no encontrada");
      }
      if (taskToUpdate.userId !== userId) {
        throw new Error("Esta tarea no te pertence... :(");
      }

      return await context.prisma.task.update({
        where: { id: id },
        data: {
          title,
          description,
          statusId,
        },
        include: { user: true, status: true },
      });
    },
    deleteTaskById: async (
      parent: any,
      args: { id: string, userId: string },
      context: Context
    ) => {
      const taskToDelete = await context.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (taskToDelete?.userId != args.userId) {
        throw new Error("Esta tarea no te pertence, no puedes eliminarla");
      }

      await context.prisma.task.delete({
        where: { id: args.id },
      });

      return true;
    },
    deleteTaskStatusById: async (
      parent: any,
      args: { id: string, userId: string},
      context: Context
    ) => {
      const statusToDelete = await context.prisma.taskStatus.findUnique({
        where: { id: args.id },
      });

      console.log(statusToDelete);
      console.log(args.userId);

      if (statusToDelete?.userId != args.userId) {
        throw new Error("Este Status no te pertenece, no puedes eliminarlo");
      }

      if (statusToDelete.isDefault === true) {
        throw new Error("Estados default no pueden eliminarse.");
      }

      const todoStatus = await context.prisma.taskStatus.findFirst({
        where: {
          userId: args.userId,
          name: "TODO",
          isDefault: true,
        },
      });

      if (!todoStatus) {
        throw new Error(
          "No hay status TODO para este usuario !!!Error critico"
        );
      }

    //REASIGNACION DE TAREAS A TODO SI EL STATUS NO ES DEFAULT 
      await context.prisma.task.updateMany({
        where: { statusId: statusToDelete.id },
        data: { statusId: todoStatus.id },
      });

     
       await context.prisma.taskStatus.delete({
        where: { id: args.id },
      });

      return true;
    },
  },
};
