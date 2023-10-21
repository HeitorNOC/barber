import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { LogIn } from 'lucide-react';
import Link from "next/link";

export default function Login() {
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
                                <Input type="email" id="email" placeholder="Email" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <Label htmlFor="senha">Senha</Label>
                                <Input type="password" id="senha" placeholder="Senha" />
                            </div>
                            <Button className="flex items-center gap-2 mb-6" variant={'secondary'}>
                                <p>Entrar</p>
                                <LogIn className="h-4 w-4" />
                            </Button>
                        </div>
                        <div>
                            <Button className='gap-4 w-full' variant={'secondary'}>
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