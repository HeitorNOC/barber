"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { useState } from "react"

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
  const [progress, setProgress] = useState<number>(0)
  const [nameChanged, setNameChanged] = useState(false)
  const [emailChanged, setEmailChanged] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [phoneChanged, setPhoneChanged] = useState(false)
  const [confirmPasswordChanged, setConfirmPassowrdChanged] = useState(false)

  function handleBlur(fieldName: string, currentValue: string) {
    switch (fieldName) {
      case "name":
        if (!nameChanged && currentValue.trim() !== '') {
          setNameChanged(true);
          handleAddProgress();
        } else if (nameChanged && currentValue.trim() === '') {
          setNameChanged(false);
          handleDecreaseProgress();
        }
        break;
      case "email":
        if (!emailChanged && currentValue.trim() !== '') {
          setEmailChanged(true);
          handleAddProgress();
        } else if (emailChanged && currentValue.trim() === '') {
          setEmailChanged(false);
          handleDecreaseProgress();
        }
        break;
      case "password":
        if (!passwordChanged && currentValue.trim() !== '') {
          setPasswordChanged(true);
          handleAddProgress();
        } else if (passwordChanged && currentValue.trim() === '') {
          setPasswordChanged(false);
          handleDecreaseProgress();
        }
        break;
      case "phone":
        if (!phoneChanged && currentValue.trim() !== '') {
          setPhoneChanged(true);
          handleAddProgress();
        } else if (phoneChanged && currentValue.trim() === '') {
          setPhoneChanged(false);
          handleDecreaseProgress();
        }
        break;
      case "confirmPassword":
        if (!confirmPasswordChanged && currentValue.trim() !== '') {
          setConfirmPassowrdChanged(true);
          handleAddProgress();
        } else if (confirmPasswordChanged && currentValue.trim() === '') {
          setConfirmPassowrdChanged(false);
          handleDecreaseProgress()
        }
  
        if (currentValue !== form.getValues('password')) {
          form.setError('password', {
            type: 'manual',
            message: 'As senhas não coincidem.'
          });
        } else {
          form.clearErrors('password');
        }
        break;
      default:
        break;
    }
  }
  


  async function onSubmit(values: z.infer<typeof formSchema>) {
    await fetch("http://localhost:3000/api/user", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values
      })
    })
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

  function handleAddProgress() {
    if (progress < 100) {
      setProgress((prev) => prev + 20)
    }
  }

  function handleDecreaseProgress() {
    if (progress !== 0) {
      setProgress((prev) => prev - 20)
    }
  }

  return (
    <div className="min-h-screen flex flex-col min-w-full justify-center">
      <div className="flex flex-col place-self-center">
        <h1 className="text-2xl">Crie sua conta</h1>
      </div>

      <div className="mt-4 flex justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-1/3"
          >
              <Progress value={progress} />
            <div className="flex flex-col gap-4 my-4">
              <FormField
                control={form.control}
                key="name"
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        key={field.name}
                        placeholder="Digite seu nome."
                        {...field}
                        onBlur={(e) => handleBlur(field.name, e.target.value)}

                      />
                    </FormControl>

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
                        placeholder="Digite seu celular."
                        {...field}
                        isMask
                        mask="(99)99999-9999"
                        onBlur={(e) => handleBlur(field.name, e.target.value)}

                      />
                    </FormControl>

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
                      <Input
                        key={field.name}
                        placeholder="Digite seu email."
                        {...field}
                        onBlur={(e) => handleBlur(field.name, e.target.value)}

                      />
                    </FormControl>

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
                      <Input
                        key={field.name}
                        placeholder="Digite sua senha."
                        {...field}
                        type="password"
                        onBlur={(e) => handleBlur(field.name, e.target.value)}

                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Input 
                key="ConfirmPassword"
                placeholder="Confirme sua senha."
                type="password"
                onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
              />
            </div>
            <Button type="submit">
              Cadastrar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
