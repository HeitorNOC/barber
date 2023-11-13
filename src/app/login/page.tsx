"use client"

import Image from 'next/image'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'
import { LogIn } from 'lucide-react'
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import {  useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const session = useSession()
    const router = useRouter()
    console.log(session)
    
    useEffect(() => {
        if (session.status == 'authenticated') {
            router.push('/')
            window.alert('Você já está logado!')
        }
    }, [session.status, router])
    
    async function handleConnectGoogle() {
        if (session.status != 'unauthenticated') {
          await signOut()
    
        }
        await signIn('google', { callbackUrl: '/' })
    
      }

      async function handleLogin() {
        if (session.status != 'unauthenticated') {
            await signOut()
          }
          const res = await signIn('credentials', { redirect: false, callbackUrl: '/', email: email, password: password, })
          /* if (res?.ok) {
            session.update({
                ...session,
                user: {
                    ...session.data?.user
                }
            })
          } */
          console.log(res)
      }

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Card className='w-[350px]'>
                <CardHeader className="gap-2">
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Entre com sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid ">
                        <div className="grid gap-6">
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input type="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <Label htmlFor="senha">Senha</Label>
                                <Input type="password" id="senha" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>
                            <Button className="flex items-center gap-2 mb-6" variant={'secondary'} onClick={handleLogin}>
                                <p>Entrar</p>
                                <LogIn className="h-4 w-4" />
                            </Button>
                        </div>
                        <div>
                            <Button className='gap-4 w-full' variant={'secondary'} onClick={handleConnectGoogle}>
                                <Image src='/google.png' alt='google' width={25} height={25} />
                                <p>Entrar com Google</p>
                            </Button>
                            <Separator className="mt-6" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="grid mt-0">
                    <Button asChild>
                        <Link href="/signUp">Criar conta</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}