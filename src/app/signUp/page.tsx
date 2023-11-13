"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"


const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O campo deve conter no mínimo 2 caracteres." })
    .max(50, { message: "O campo deve conter no máximo 50 caracteres." }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(4, { message: "O campo deve conter no mínimo 4 caracteres." })
    .max(20, { message: "O campo deve conter no máximo 20 caracteres." }),
  phone: z
    .string()
    .refine((celular) => /^\(\d{2}\)\d\d{4}-\d{4}$/.test(celular), {
      message: "Número de celular inválido. O formato deve ser (99)99999-9999",
    }),
  
})

export default function SignUp() {

  async function onSubmit(values: z.infer<typeof formSchema>) {
    //const hashedPassword = await bcrypt.hash(values.password, 10)
    const res = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values
      })
    })

    console.log(res)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl">Crie sua conta</h1>
      <Progress value={33} className="w-[26%]" />

      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-[500px]"
          >
              <>
                <FormField
                  control={form.control}
                  key="name"
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input key={field.name} placeholder="nome" {...field}  />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  key="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de celular</FormLabel>
                      <FormControl>
                        <Input
                          key={field.name}
                          placeholder="celular"
                          {...field}
                          isMask
                          mask="(99)99999-9999"
                        />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  key="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input key={field.name} placeholder="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  key="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input key={field.name} placeholder="senha" {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
              <Button type="submit">
                Cadastrar
              </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
