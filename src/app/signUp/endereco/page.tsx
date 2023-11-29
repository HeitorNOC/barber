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
    const [progress, setProgress] = useState<number>(0)
    const [loader, setLoader] = useState<boolean>(false)
    const [estado, setEstado] = useState<String | undefined>()
    const [cidade, setCidade] = useState<String | undefined>()
    const [estados, setEstados] = useState<any>()
    const [cidades, setCidades] = useState<any>()
    const [cepChanged, setCepChanged] = useState(false);
    const [ufChanged, setUfChanged] = useState(false);
    const [cidadeChanged, setCidadeChanged] = useState(false);
    const [bairroChanged, setBairroChanged] = useState(false);
    const [ruaChanged, setRuaChanged] = useState(false);
    const [complementoChanged, setComplementoChanged] = useState(false);
    const [numeroChanged, setNumeroChanged] = useState(false);

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
            if (!cepChanged && value.trim() !== '') {
              setCepChanged(true);
              handleAddProgress(10);
            } else if (cepChanged && value.trim() === '') {
              setCepChanged(false);
              handleDecreaseProgress(10);
            }
            break;
          case "uf":
            if (!ufChanged && value.trim() !== '') {
              setUfChanged(true);
              handleAddProgress(10);
            } else if (ufChanged && value.trim() === '') {
              setUfChanged(false);
              handleDecreaseProgress(10);
            }
            break;
          case "cidade":
            if (!cidadeChanged && value.trim() !== '') {
              setCidadeChanged(true);
              handleAddProgress(10);
            } else if (cidadeChanged && value.trim() === '') {
              setCidadeChanged(false);
              handleDecreaseProgress(10);
            }
            break;
          case "bairro":
            if (!bairroChanged && value.trim() !== '') {
              setBairroChanged(true);
              handleAddProgress(10);
            } else if (bairroChanged && value.trim() === '') {
              setBairroChanged(false);
              handleDecreaseProgress(10);
            }
            break;
          case "rua":
            if (!ruaChanged && value.trim() !== '') {
              setRuaChanged(true);
              handleAddProgress(10);
            } else if (ruaChanged && value.trim() === '') {
              setRuaChanged(false);
              handleDecreaseProgress(10);
            }
            break;
          case "complemento":
            if (!complementoChanged && value.trim() !== '') {
              setComplementoChanged(true);
              handleAddProgress(10);
            } else if (complementoChanged && value.trim() === '') {
              setComplementoChanged(false);
              handleDecreaseProgress(10);
            }
            break;
          case "numero":
            if (!numeroChanged && value.trim() !== '') {
              setNumeroChanged(true);
              handleAddProgress(10);
            } else if (numeroChanged && value.trim() === '') {
              setNumeroChanged(false);
              handleDecreaseProgress(10);
            }
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
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
                        form.setValue("uf", data.uf)
                        form.setValue("cidade", data.localidade)
                        form.setValue("bairro", data.bairro)
                        form.setValue("rua", data.logradouro)
                        handleAddProgress(70)
                    }
                })
        } else if (e.target.value == "") {
            handleDecreaseProgress(10)
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
                                                    onBlur={(e) => handleSetFieldChange(field.name, e.target.value)}
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