"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
    cep: z.string().refine((cep) => /^\d{5}-\d{3}$/.test(cep), {
        message: "CEP inválido. O formato deve ser 00000-000",
    }),
    rua: z
        .string()
        .min(3, { message: "O campo deve conter no mínimo 3 caracteres." })
        .max(30, { message: "O campo deve conter no máximo 30 caracteres." }),
    numero: z
        .string()
        .min(1, { message: "O campo deve conter no mínimo 1 caracter." })
        .max(4, { message: "O campo deve conter no máximo 4 caracteres." })
        .refine((numero) => /^[0-9]+$/.test(numero), {
            message: "O campo deve conter apenas números.",
        }),
    complemento: z.string().optional(),
    uf: z.string(),
    cidade: z.string(),
    bairro: z
        .string()
        .min(3, { message: "O campo deve conter no mínimo 3 caracteres." })
        .max(30, { message: "O campo deve conter no máximo 30 caracteres." }),

})

export default function Endereco() {
    const [error, setError] = useState<String>("")
    const [loader, setLoader] = useState<boolean>(false)
    const [estado, setEstado] = useState<String | undefined>()
    const [cidade, setCidade] = useState<String | undefined>()
    const [estados, setEstados] = useState<any>()
    const [cidades, setCidades] = useState<any>()

    const listStates = async () => {
        const response = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
        setEstados(response.data)
        return response.data
    }

    const listCidades = async (ufID: number) => {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufID}/municipios`)

        setCidades(response.data)
    }

    const {
        data,
        isLoading,
        isError
    } = useQuery({ queryKey: ["states"], queryFn: listStates })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    function handleSetEstado(e: any) {
        if (e) {
            const actualState = estados.find((state: any) => state.sigla == e)
            setEstado(e)
            listCidades(actualState.id)
        }
    }

    function handleSetCidade(e: any) {
        if (e) {
            setCidade(e)
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bairro: "",
            cep: "",
            cidade: "",
            rua: "",
            uf: "",
        },
    },
    )

    async function handleCheckCep(e: any) {
        setLoader(true)
        if (e.target.value != "" && e.target.value.length == 9) {
            const cep = e.target.value.replace(/\D/g, "")
            await fetch(`https://viacep.com.br/ws/${cep}/json`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.erro) {
                        setError("CEP inválido.")
                    } else {
                        handleSetEstado(data.uf)
                        handleSetCidade(data.localidade)
                        form.setValue("uf", data.uf)
                        form.setValue("cidade", data.localidade)
                        form.setValue("bairro", data.bairro)
                        form.setValue("rua", data.logradouro)
                    }
                })
        }
        setLoader(false)
    }

    return isLoading || loader ? (
        <div className="flex justify-center items-center min-h-screen">
            <Loader />
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
            <h1 className="text-2xl">Endereço</h1>
            <Progress value={66} className="w-[26%]" />

            <div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 w-[500px]"
                    >

                        <>
                            <FormField
                                control={form.control}
                                name="cep"
                                key="cep"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CEP</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="CEP"
                                                key={field.name}
                                                {...field}
                                                isMask
                                                mask="99999-999"
                                                onBlur={handleCheckCep}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="uf"
                                key="uf"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>UF</FormLabel>
                                        <Select
                                            key={field.name}
                                            onValueChange={(e) => {
                                                handleSetEstado(e)
                                                field.onChange(e)
                                            }}
                                            defaultValue={field.value}
                                            value={String(estado)}
                                            disabled={!data}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o estado do seu endereço." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {data.map((state: any) => (
                                                    <SelectItem
                                                        {...field}
                                                        key={state.id}
                                                        value={state.sigla}
                                                    >
                                                        {state.sigla}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cidade"
                                key="cidade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cidade</FormLabel>
                                        <Select
                                            key={field.name}
                                            disabled={!estado}
                                            onValueChange={(e) => {
                                                handleSetCidade(e)
                                                field.onChange(e)
                                            }}
                                            value={String(cidade)}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a cidade do seu endereço." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {cidades ? (
                                                    cidades.map((cidadeAtual: any) => (
                                                        <SelectItem
                                                            {...field}
                                                            key={cidadeAtual.id}
                                                            value={cidadeAtual.nome}
                                                        >
                                                            {cidadeAtual.nome}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <>
                                                        <p>
                                                            Não foi possível encontrar as cidades do seu
                                                            estado, digite-a por favor.
                                                        </p>
                                                        <Input
                                                            disabled={!estado}
                                                            placeholder="Digite a cidade do seu endereço."
                                                            {...field}
                                                            onChange={handleSetCidade}
                                                        />
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bairro"
                                key="bairro"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bairro</FormLabel>
                                        <FormControl>
                                            <Input
                                                key={field.name}
                                                disabled={!cidade}
                                                placeholder="Digite o bairro do seu endereço."
                                                {...field}
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
                                name="rua"
                                key="rua"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rua</FormLabel>
                                        <FormControl>
                                            <Input
                                                key={field.name}
                                                placeholder="Digite a rua do seu endereço."
                                                {...field}
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
                                name="complemento"
                                key="complemento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Complemento</FormLabel>
                                        <FormControl>
                                            <Input
                                                key={field.name}
                                                placeholder="Complemento"
                                                {...field}
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
                                name="numero"
                                key="numero"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número</FormLabel>
                                        <FormControl>
                                            <Input
                                                key={field.name}
                                                placeholder="Numero"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                        <Button type="submit" disabled={error != "" || isError}>
                            Cadastrar Endereço
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}