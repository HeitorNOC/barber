import { signJwtAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";

interface RequestBody {
  email: string;
  hashedPassword: string;
}
export async function POST(request: Request) {
  const body: RequestBody = await request.json();

  const user = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
  });

  if (user && user.hashedPassword && (await bcrypt.compare(body.hashedPassword, user.hashedPassword))) {
      const { hashedPassword, ...userWithoutPass } = user
      const accessToken = signJwtAccessToken(userWithoutPass);
      
      const result = {
          ...userWithoutPass,
          accessToken,
        };
    return new Response(JSON.stringify(result));
  } else
    return new Response(
      JSON.stringify({
        message: "Unathenticated",
      }),
      {
        status: 401,
      }
    );
}