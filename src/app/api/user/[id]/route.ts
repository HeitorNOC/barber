import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateRequestBodySchema = z.object({
  cep: z.string(),
  uf: z.string(),
  cidade: z.string(),
  bairro: z.string(),
  rua: z.string(),
  complemento: z.string().optional(),
  numero: z.string(),
});

type UpdateRequestBody = z.infer<typeof UpdateRequestBodySchema>;

export async function POST(request: Request) {
  try {
    const id = request.url.split('/').pop()

    const requestBody: UpdateRequestBody = UpdateRequestBodySchema.parse(await request.json());

    if (!id || typeof id !== "string") {
      return new Response(
        JSON.stringify({
          message: "ID inválido.",
        }),
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        address: true
      }
    });

    if (!existingUser) {
      return new Response(
        JSON.stringify({
          message: "Usuário não encontrado.",
        }),
        { status: 404 }
      );
    }

    if (!existingUser.address) {
      if (requestBody.complemento) {
        const addressCreated = await prisma.address.create({
          data: {
            userId: id,
            cep: requestBody.cep,
            uf: requestBody.uf,
            cidade: requestBody.cidade,
            bairro: requestBody.bairro,
            rua: requestBody.rua,
            complemento: requestBody.complemento,
            numero: Number(requestBody.numero),
          },
        });
        return new Response(
          JSON.stringify({
            message: "Dados atualizados com sucesso.",
            addressCreated,
          }),
          { status: 200 }
        );
      } else {
        const addressCreated = await prisma.address.create({
          data: {
            userId: id,
            cep: requestBody.cep,
            uf: requestBody.uf,
            cidade: requestBody.cidade,
            bairro: requestBody.bairro,
            rua: requestBody.rua,
            numero: Number(requestBody.numero),
          },
        });
        return new Response(
          JSON.stringify({
            message: "Dados atualizados com sucesso.",
            addressCreated,
          }),
          { status: 200 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          message: "Usuário já tem um endereço cadastrado, tente editar-lo.",
        }),
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.log(error.message)
    return new Response(
      JSON.stringify({
        message: "Erro ao processar a solicitação.",
        error: error.message,
      }),
      { status: 400 }
    );
  }
}
