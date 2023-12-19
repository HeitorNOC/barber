"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter, useParams } from "next/navigation"

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
    const [progress, setProgress] = useState<number>(0)
    const [loader, setLoader] = useState<boolean>(false)
    const [estado, setEstado] = useState<String | undefined>()
    const [cidade, setCidade] = useState<String | undefined>()
    const [estados, setEstados] = useState<any>()
    const [cidades, setCidades] = useState<any>()
    const [cepChanged, setCepChanged] = useState('');
    const [ufChanged, setUfChanged] = useState('');
    const [cidadeChanged, setCidadeChanged] = useState('');
    const [bairroChanged, setBairroChanged] = useState('');
    const [ruaChanged, setRuaChanged] = useState('');
    const [complementoChanged, setComplementoChanged] = useState('');
    const [numeroChanged, setNumeroChanged] = useState('');
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        if (!params.id) {
            router.push('/')
        }
    }, [params.id])


    function handleAddProgress(amount: number) {
        if (progress < 100) {
            setProgress((prev) => Math.min(prev + amount, 100));
        }
    }

    function handleDecreaseProgress(amount: number) {
        if (progress > 0) {
            setProgress((prev) => Math.max(prev - amount, 0));
        }
    }

    function handleSetFieldChange(field: string, value: string) {
        switch (field) {
            case "cep":
                if (value == cepChanged && value.trim().length > 1 || cepChanged.length > 1 && value.length > 1) {
                    setCepChanged(value)
                    break
                }
                else if (value != cepChanged && value.trim() !== '') {
                    handleAddProgress(10);
                } else if (value.trim() == '') {
                    handleDecreaseProgress(10)
                }
                setCepChanged(value)
                break;
            case "uf":
                if (value == ufChanged && value.trim().length > 1 || ufChanged.length > 1 && value.length > 1) {
                    setUfChanged(value)
                    break
                }
                else if (value != ufChanged && value.trim() !== '') {
                    handleAddProgress(10);
                } else if (value.trim() == '') {
                    handleDecreaseProgress(10);
                }
                setUfChanged(value)
                break;
            case "cidade":
                if (value == cidadeChanged && value.trim().length > 1 || cidadeChanged.length > 1 && value.length > 1) {
                    setCidadeChanged(value)
                    break
                }
                else if (value !== cidadeChanged && value.trim() !== '') {
                    handleAddProgress(10);
                }
                else if (value.trim() == '') {
                    handleDecreaseProgress(10);
                }
                setCidadeChanged(value)
                break;
            case "bairro":
                if (value == bairroChanged && value.trim().length > 1 || bairroChanged.length > 1 && value.length > 1) {
                    setBairroChanged(value)
                    break
                }
                else if (value != bairroChanged && value.trim() !== '') {
                    handleAddProgress(10);
                } else if (value.trim() == '' || !value) {
                    handleDecreaseProgress(10);
                }
                setBairroChanged(value)
                break;
            case "rua":
                if (value == ruaChanged && value.trim().length > 1 || ruaChanged.length > 1 && value.length > 1) {
                    setRuaChanged(value)
                    break
                }
                else if (value != ruaChanged && value.trim() !== '') {
                    handleAddProgress(10);
                } else if (value.trim() === '') {
                    handleDecreaseProgress(10);
                }
                setRuaChanged(value)
                break;
            case "complemento":
                if (value == complementoChanged && value.trim().length > 1 || complementoChanged.length > 1 && value.length > 1) {
                    setComplementoChanged(value)
                    break
                }
                else if (value != complementoChanged && value.trim() !== '') {
                    handleAddProgress(10);
                } else if (value.trim() === '') {
                    handleDecreaseProgress(10);
                }
                setComplementoChanged(value)
                break;
            case "numero":
                if (value.toString() == numeroChanged && value.toString().trim().length > 1 || numeroChanged.length > 1 && value.length > 1) {
                    setNumeroChanged(value.toString())
                    break
                }
                else if (value.toString() != numeroChanged && value.toString().trim() !== '') {
                    handleAddProgress(10);
                } else if (value.toString().trim() === '') {
                    handleDecreaseProgress(10);
                }
                setNumeroChanged(value.toString())
                break;
            default:
                break;
        }
    }

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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const res = await fetch(`http://localhost:3000/api/user/${params.id}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...values
            })
        })

        if (res.ok) {
            router.push('/')
        }
    }

    function handleSetEstado(e: any) {
        if (e) {
            const actualState = estados.find((state: any) => state.sigla == e)
            listCidades(actualState.id)
            setEstado(e)
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
                        form.setValue("rua", data.logradouro)
                        form.setValue("bairro", data.bairro)
                        form.setValue("cidade", data.localidade)
                        form.setValue("uf", data.uf)
                        setUfChanged(data.uf)
                        setCepChanged(e.target.value)
                        setCidadeChanged(data.localidade)
                        setRuaChanged(data.logradouro)
                        setBairroChanged(data.bairro)
                        handleAddProgress(70)
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
        <div className="min-h-screen flex flex-col min-w-full justify-center">
            <div className="flex flex-col place-self-center">
                <h1 className="text-2xl">Endereço</h1>
            </div>

            <div className="mt-4 flex justify-center">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-1/3"
                    >
                        <Progress value={progress} className="mb-4" />

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
                                            onBlur={(e) => {
                                                handleCheckCep(e)
                                                handleSetFieldChange(field.name, e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex gap-4 min-w-full">
                                <FormField
                                    control={form.control}
                                    name="uf"
                                    key="uf"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>UF</FormLabel>
                                            <Select
                                                key={field.name}
                                                onValueChange={(e) => {
                                                    handleSetEstado(e)
                                                    field.onChange(e)
                                                    handleSetFieldChange(field.name, e)
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
                                                    <SelectGroup className="overflow-y-auto max-h-[20rem]">
                                                        {data.map((state: any) => (
                                                            <SelectItem
                                                                {...field}
                                                                key={state.id}
                                                                value={state.sigla}
                                                            >
                                                                {state.sigla}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cidade"
                                    key="cidade"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>Cidade</FormLabel>
                                            <Select
                                                key={field.name}
                                                disabled={!estado}
                                                onValueChange={(e) => {
                                                    handleSetCidade(e)
                                                    field.onChange(e)
                                                    handleSetFieldChange(field.name, e)
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
                                                    <SelectGroup className="overflow-y-auto max-h-[20rem]">
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
                                                            <></>
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-4">
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
                                                    onBlur={(e) => handleSetFieldChange(field.name, e.target.value)}
                                                />
                                            </FormControl>

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
                                                    onBlur={(e) => {
                                                        handleSetFieldChange(field.name, e.target.value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex min-w-full gap-4">
                                <FormField
                                    control={form.control}
                                    name="complemento"
                                    key="complemento"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>Complemento</FormLabel>
                                            <FormControl>
                                                <Input
                                                    key={field.name}
                                                    placeholder="Complemento"
                                                    {...field}
                                                    onBlur={(e) => handleSetFieldChange(field.name, e.target.value)}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numero"
                                    key="numero"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>Número</FormLabel>
                                            <FormControl>
                                                <Input
                                                    key={field.name}
                                                    placeholder="Numero"
                                                    {...field}
                                                    onBlur={(e) => handleSetFieldChange(field.name, e.target.value)}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={error != "" || isError} className="mt-4">
                            Cadastrar Endereço
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}