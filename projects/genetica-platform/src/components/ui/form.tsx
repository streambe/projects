"use client";
/**
 * Minimal Form wrapper around react-hook-form.
 * Sprint 2+ devs: extend with FormField/FormItem/FormLabel/FormMessage as needed.
 */
import * as React from "react";
import { FormProvider, useFormContext, type UseFormReturn, type FieldValues } from "react-hook-form";

export const Form = FormProvider;
export { useFormContext };
export type { UseFormReturn, FieldValues };
