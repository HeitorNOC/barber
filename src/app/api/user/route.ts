import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcrypt"

interface RequestBody {
    name: string
    email: string
    password: string
    phone: string
  }

export async function POST(request: Request) {
    const { email, name, password, phone }: RequestBody =  await request.json()

    const user = await prisma.user.findFirst({
        where: {
            email
        }
    })

    if (user) {
        return new Response(JSON.stringify({
            message: "Email já cadastrado."
        })),
        { status: 500 } 
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userCreated = await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword,
            phone
        }
    })

    if (userCreated) {
        return new Response(JSON.stringify({
            message: "Usuário cadastrado com sucesso."
        })),
        { status: 201 }
    }
}