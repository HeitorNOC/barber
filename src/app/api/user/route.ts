import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { z } from "zod";

const RequestBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string(),
});

type RequestBody = z.infer<typeof RequestBodySchema>;

export async function POST(request: Request) {
  try {
    const requestBody: RequestBody = RequestBodySchema.parse(await request.json());

    const existingUser = await prisma.user.findFirst({
      where: {
        email: requestBody.email,
      },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          message: "Email já cadastrado.",
        }),
        { status: 500 }
      );
    }

    const hashedPassword = await bcrypt.hash(requestBody.password, 10);

    const userCreated = await prisma.user.create({
      data: {
        name: requestBody.name,
        email: requestBody.email,
        hashedPassword,
        phone: requestBody.phone,
      },
    });

    if (userCreated) {
      return new Response(
        JSON.stringify({
          message: "Usuário cadastrado com sucesso.",
          id: userCreated.id
        }),
        { status: 201 }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Erro no servidor, tente novamente mais tarde.",
        }),
        { status: 500 }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "Erro ao processar a solicitação.",
        error: error.message,
      }),
      { status: 400 }
    );
  }
}
