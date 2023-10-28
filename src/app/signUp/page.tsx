"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import states from "@/app/assets/data.json";

type addressType = {
  bairro: string;
  cep: string;
  complemento: string;
  ddd: string;
  gia: string;
  ibge: string;
  localidade: string;
  logradouro: string;
  siafi: string;
  uf: string;
};

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O campo deve conter no mínimo 2 caracteres." })
    .max(50, { message: "O campo deve conter no máximo 50 caracteres." }),
  email: z.string().email({ message: "Email inválido" }),
  senha: z
    .string()
    .min(4, { message: "O campo deve conter no mínimo 4 caracteres." })
    .max(20, { message: "O campo deve conter no máximo 20 caracteres." }),
  celular: z
    .string()
    .refine((celular) => /^\(\d{2}\)\d\d{4}-\d{4}$/.test(celular), {
      message: "Número de celular inválido. O formato deve ser (99)99999-9999",
    }),
  endereço: z.object({
    cep: z.string().refine((cep) => /^\d{5}-\d{3}$/.test(cep), {
      message: "CEP inválido. O formato deve ser 00000-000",
    }),
    rua: z
      .string()
      .min(3, { message: "O campo deve conter no mínimo 3 caracteres." })
      .max(30, { message: "O campo deve conter no máximo 30 caracteres." }),
    numero: z
      .string()
      .min(1)
      .max(4)
      .refine((numero) => /^[0-9]+$/.test(numero), {
        message: "O campo deve conter apenas números.",
      }),
    complemento: z.string(),
    uf: z.string(),
    cidade: z.string(),
    bairro: z.string(),
  }),
});

export default function SignUp() {
  const [progress, setProgress] = useState(50);
  const [address, setAddress] = useState<addressType>();
  const [error, setError] = useState<String>();
  const [estado, setEstado] = useState<String | undefined>();
  const [cidade, setCidade] = useState<String | undefined>();
  const [bairro, setBairro] = useState<String | undefined>();
  const [rua, setRua] = useState<String>("");
  const [complemento, setComplemento] = useState<String>("");
  const [numero, setNumero] = useState<String>("");
  const [cidades, setCidades] = useState<Array<String>>();
  const [bairros, setBairros] = useState<Array<String>>();

  function onSubmit(values: z.infer<typeof formSchema>) {
    //console.log(values)
  }

  function handleBackStep() {
    setProgress(50);
  }

  function handleNextStep() {
    setProgress(100);
  }

  function handleSetEstado(e: any) {
    if (e) {
      setEstado(e);

      const cidadesKeys: any = states.find((item) => item.estado == e);
      if (cidadesKeys) {
        setCidades(Object.keys(cidadesKeys.cidades[0]));
      }
    }
  }

  function handleSetCidade(e: any, uf?: string) {
    if (e) {
      setCidade(e);

      const cidadesAux = states.find((item) => item.estado == uf ?? estado);
      if (cidadesAux) {
        const bairrosKeys: any = cidadesAux.cidades[0];
        setBairros(bairrosKeys[e]);
      }
    }
  }

  function handleSetBairro(e: any) {
    if (e) {
      setBairro(e);
    }
  }

  const handleNumeroChange = (e: any) => {
    const inputText = e.target.value;
    const numericText = inputText.replace(/\D/g, "");
    setNumero(numericText);
  };

  async function handleCheckCep(e: any) {
    if (e.target.value != "" && e.target.value.length == 9) {
      const cep = e.target.value.replace(/\D/g, "");
      await fetch(`https://viacep.com.br/ws/${cep}/json`)
        .then((res) => res.json())
        .then((data) => {
          if (data.erro) {
            setError("CEP inválido.");
          } else {
            handleSetEstado(data.uf);
            handleSetCidade(data.localidade, data.uf);
            handleSetBairro(data.bairro);
            setRua(data.logradouro);
            setComplemento(data.complemento);
            setAddress(data);
          }
        });
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      senha: "",
      celular: "",
      endereço: {
        bairro: "",
        cep: "",
        cidade: "",
        complemento: "",
        rua: "",
        uf: "",
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl">Crie sua conta</h1>
      <Progress value={progress} className="w-[26%]" />

      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-[500px]"
          >
            {progress == 50 ? (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="nome" {...field} />
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
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de celular</FormLabel>
                      <FormControl>
                        <Input
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email" {...field} />
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
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input placeholder="senha" {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <h2>Endereço</h2>
                <FormField
                  control={form.control}
                  name="endereço.cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CEP"
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
                  name="endereço.uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <Select
                        onValueChange={(e) => {
                          handleSetEstado(e);
                          field.onChange(e);
                        }}
                        defaultValue={field.value}
                        value={String(estado)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado do seu endereço." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem
                              {...field}
                              key={state.estado}
                              value={state.estado}
                            >
                              {state.estado}
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
                {/* TODO:  Mover condicional de cidades para cima do componente Select*/}
                <FormField
                  control={form.control}
                  name="endereço.cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select
                        disabled={!estado}
                        onValueChange={(e) => {
                          handleSetCidade(e);
                          field.onChange(e);
                        }}
                        defaultValue={field.value}
                        value={String(cidade)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cidade do seu endereço." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cidades ? (
                            cidades.map((cidadeAtual) => (
                              <SelectItem
                                {...field}
                                key={String(cidadeAtual)}
                                value={String(cidadeAtual)}
                              >
                                {cidadeAtual}
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
                                placeholder="Digite sua cidade"
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
                  name="endereço.bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <Select
                        disabled={!cidade}
                        onValueChange={(e) => {
                          handleSetBairro(e);
                          field.onChange(e);
                        }}
                        defaultValue={field.value}
                        value={String(bairro)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o bairro do seu endereço." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bairros ? (
                            bairros.map((bairroAtual) => (
                              <SelectItem
                                {...field}
                                key={String(bairroAtual)}
                                value={String(bairroAtual)}
                              >
                                {bairroAtual}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <p>
                                Não foi possível encontrar os bairros da sua
                                cidade, digite-o por favor.
                              </p>
                              <Input
                                disabled={!cidade}
                                placeholder="Digite seu bairro"
                                {...field}
                                onChange={handleSetBairro}
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
                  name="endereço.rua"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua"
                          {...field}
                          value={String(rua)}
                          onChange={(e) => setRua(e.target.value)}
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
                  name="endereço.complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Complemento"
                          {...field}
                          value={String(complemento)}
                          onChange={(e) => setComplemento(e.target.value)}
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
                  name="endereço.numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Numero"
                          {...field}
                          value={String(numero)}
                          onChange={handleNumeroChange}
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
            )}

            {progress == 50 ? (
              <Button type="button" onClick={handleNextStep}>
                Próximo
              </Button>
            ) : (
              <>
                <Button onClick={handleBackStep} className="mr-4">
                  Voltar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
