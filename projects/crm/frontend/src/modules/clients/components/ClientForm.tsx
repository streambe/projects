import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { Client, CreateClientInput } from '../clients.types';
import { useCreateClient, useUpdateClient } from '../hooks/useClients';

// ---------------------------------------------------------------------------
// Validation schema — all messages in Spanish
// ---------------------------------------------------------------------------

const clientSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .max(100, 'El apellido no puede superar los 100 caracteres'),
  dni: z
    .string()
    .min(1, 'El DNI es obligatorio')
    .max(20, 'El DNI no puede superar los 20 caracteres'),
  phonePrimary: z
    .string()
    .min(1, 'El teléfono principal es obligatorio')
    .max(30, 'El teléfono no puede superar los 30 caracteres'),
  phoneAlt: z.string().max(30, 'El teléfono no puede superar los 30 caracteres').optional(),
  email: z.string().email('El correo electrónico no es válido').optional().or(z.literal('')),
  whatsappNumber: z
    .string()
    .max(30, 'El número de WhatsApp no puede superar los 30 caracteres')
    .optional(),
  city: z.string().max(100, 'La ciudad no puede superar los 100 caracteres').optional(),
  province: z.string().max(100, 'La provincia no puede superar los 100 caracteres').optional(),
  birthDate: z.string().optional(),
  howFoundUs: z
    .enum(['instagram', 'facebook', 'google', 'referido', 'visita_directa', 'otro', ''])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClientFormProps {
  client?: Client;
  onSuccess?: (client: Client | null) => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const isEditing = !!client;

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient(client?.id ?? '');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: client?.firstName ?? '',
      lastName: client?.lastName ?? '',
      dni: client?.dni ?? '',
      phonePrimary: client?.phonePrimary ?? '',
      phoneAlt: client?.phoneAlt ?? '',
      email: client?.email ?? '',
      whatsappNumber: client?.whatsappNumber ?? '',
      city: client?.city ?? '',
      province: client?.province ?? '',
      birthDate: client?.birthDate?.split('T')[0] ?? '',
      howFoundUs: client?.howFoundUs ?? undefined,
      notes: client?.notes ?? '',
    },
  });

  // isSubmitting from RHF is true for the entire duration of the async onSubmit handler.
  // This is the most reliable way to disable the button during submission.
  const isPending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    const input: CreateClientInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      dni: values.dni,
      phonePrimary: values.phonePrimary,
      ...(values.phoneAlt && { phoneAlt: values.phoneAlt }),
      ...(values.email && { email: values.email }),
      ...(values.whatsappNumber && { whatsappNumber: values.whatsappNumber }),
      ...(values.city && { city: values.city }),
      ...(values.province && { province: values.province }),
      ...(values.birthDate && { birthDate: values.birthDate }),
      ...(values.howFoundUs && { howFoundUs: values.howFoundUs }),
      ...(values.notes && { notes: values.notes }),
    };

    try {
      if (isEditing) {
        const result = await updateMutation.mutateAsync(input);
        if (result.conflict) {
          const fieldLabel = result.conflict.field === 'dni' ? 'DNI' : 'teléfono principal';
          toast.error(
            `Ya existe un cliente con ese ${fieldLabel}: ${result.conflict.fullName}`,
          );
          return;
        }
        toast.success('Cliente actualizado correctamente');
        onSuccess?.(result.client as Client | null);
      } else {
        const result = await createMutation.mutateAsync(input);
        if (result.conflict) {
          const fieldLabel = result.conflict.field === 'dni' ? 'DNI' : 'teléfono principal';
          toast.error(
            `Ya existe un cliente con ese ${fieldLabel}: ${result.conflict.fullName}`,
          );
          return;
        }
        toast.success('Cliente creado correctamente');
        onSuccess?.(result.client as Client | null);
      }
    } catch {
      toast.error(
        isEditing
          ? 'No se pudo actualizar el cliente. Intentá nuevamente.'
          : 'No se pudo crear el cliente. Intentá nuevamente.',
      );
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate data-testid="client-form">
      <div className="grid grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.firstName && (
            <p id="firstName-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.lastName && (
            <p id="lastName-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* DNI */}
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
            DNI <span className="text-red-500">*</span>
          </label>
          <input
            id="dni"
            type="text"
            {...register('dni')}
            aria-invalid={!!errors.dni}
            aria-describedby={errors.dni ? 'dni-error' : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.dni && (
            <p id="dni-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.dni.message}
            </p>
          )}
        </div>

        {/* Teléfono principal */}
        <div>
          <label htmlFor="phonePrimary" className="block text-sm font-medium text-gray-700">
            Teléfono principal <span className="text-red-500">*</span>
          </label>
          <input
            id="phonePrimary"
            type="tel"
            {...register('phonePrimary')}
            aria-invalid={!!errors.phonePrimary}
            aria-describedby={errors.phonePrimary ? 'phonePrimary-error' : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.phonePrimary && (
            <p id="phonePrimary-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.phonePrimary.message}
            </p>
          )}
        </div>

        {/* Teléfono alternativo */}
        <div>
          <label htmlFor="phoneAlt" className="block text-sm font-medium text-gray-700">
            Teléfono alternativo
          </label>
          <input
            id="phoneAlt"
            type="tel"
            {...register('phoneAlt')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">
            Número de WhatsApp
          </label>
          <input
            id="whatsappNumber"
            type="tel"
            {...register('whatsappNumber')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Localidad / Ciudad
          </label>
          <input
            id="city"
            type="text"
            {...register('city')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Provincia */}
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700">
            Provincia
          </label>
          <input
            id="province"
            type="text"
            {...register('province')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            Fecha de nacimiento
          </label>
          <input
            id="birthDate"
            type="date"
            {...register('birthDate')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cómo nos conoció */}
        <div>
          <label htmlFor="howFoundUs" className="block text-sm font-medium text-gray-700">
            Cómo nos conoció
          </label>
          <select
            id="howFoundUs"
            {...register('howFoundUs')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="google">Google</option>
            <option value="referido">Referido</option>
            <option value="visita_directa">Visita directa</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Notas */}
      <div className="mt-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notas internas
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          aria-disabled={isPending}
          data-testid="submit-button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </form>
  );
}
