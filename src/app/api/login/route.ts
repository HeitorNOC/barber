import { signJwtAccessToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcrypt"

interface RequestBody {
  email: string
  password: string
}
export async function GET(request: Request) {
  const body: RequestBody = await request.json()

  const user = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
  })

  if(user?.hashedPassword) {
    const newHashedPassword = await bcrypt.hash(user.hashedPassword, 10)
    
    if (user && user.hashedPassword && (await bcrypt.compare(body.password, newHashedPassword))) {
      const { hashedPassword, ...userWithoutPass } = user
      const accessToken = signJwtAccessToken(userWithoutPass)
      const result = {
        ...userWithoutPass,
        accessToken,
      }
      return new Response(JSON.stringify(result))
    }
  } else
    return new Response(
      JSON.stringify({
        message: "Unathenticated",
      }),
      {
        status: 401,
      }
    )
}