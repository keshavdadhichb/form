'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from '@/lib/i18n';
import { useFormStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface BasicsStepProps {
  onNext: () => void;
}

interface FormValues {
  name: string;
  phone: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  fatherName: string;
  motherName: string;
}

const MONTHS_HI = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const currentYear = new Date().getFullYear();

export default function BasicsStep({ onNext }: BasicsStepProps) {
  const { t, lang } = useTranslation();
  const { name, phone, dob, fatherName, motherName, setBasics } = useFormStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name,
      phone,
      dobDay: dob.day,
      dobMonth: dob.month,
      dobYear: dob.year,
      fatherName,
      motherName,
    },
  });

  const watched = watch();
  useEffect(() => {
    setBasics({
      name: watched.name ?? '',
      phone: watched.phone ?? '',
      dob: { day: watched.dobDay ?? '', month: watched.dobMonth ?? '', year: watched.dobYear ?? '' },
      fatherName: watched.fatherName ?? '',
      motherName: watched.motherName ?? '',
    });
  }, [watched.name, watched.phone, watched.dobDay, watched.dobMonth, watched.dobYear, watched.fatherName, watched.motherName]); // eslint-disable-line react-hooks/exhaustive-deps

  const months = lang === 'hi' ? MONTHS_HI : MONTHS_EN;

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-7 px-6 py-8 max-w-md mx-auto w-full">
      <h2
        className="text-2xl text-ink text-center mb-2"
        style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
      >
        {t('basics.heading')}
      </h2>

      {/* Name */}
      <Input
        label={t('basics.name')}
        placeholder={t('basics.name.placeholder')}
        error={errors.name?.message}
        autoComplete="name"
        {...register('name', { required: t('basics.required') })}
      />

      {/* Mobile number */}
      <Input
        label={t('basics.phone')}
        placeholder={t('basics.phone.placeholder')}
        error={errors.phone?.message}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        {...register('phone', {
          required: t('basics.required'),
          pattern: {
            value: /^[0-9+\s\-().]{7,15}$/,
            message: lang === 'hi' ? 'सही मोबाइल नंबर डालें' : 'Enter a valid mobile number',
          },
        })}
      />

      {/* Date of Birth */}
      <div>
        <p className="text-sm text-ink-muted font-sans mb-3 px-1">{t('basics.dob')}</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Controller
              name="dobDay"
              control={control}
              rules={{ required: t('basics.required') }}
              render={({ field }) => (
                <SelectDropdown
                  label={t('basics.dob.day')}
                  value={field.value}
                  onChange={field.onChange}
                  options={Array.from({ length: 31 }, (_, i) => ({
                    value: String(i + 1),
                    label: String(i + 1),
                  }))}
                  error={!!errors.dobDay}
                />
              )}
            />
          </div>
          <div className="flex-[2]">
            <Controller
              name="dobMonth"
              control={control}
              rules={{ required: t('basics.required') }}
              render={({ field }) => (
                <SelectDropdown
                  label={t('basics.dob.month')}
                  value={field.value}
                  onChange={field.onChange}
                  options={months.map((m, i) => ({ value: String(i + 1), label: m }))}
                  error={!!errors.dobMonth}
                />
              )}
            />
          </div>
          <div className="flex-[1.5]">
            <Controller
              name="dobYear"
              control={control}
              rules={{ required: t('basics.required') }}
              render={({ field }) => (
                <SelectDropdown
                  label={t('basics.dob.year')}
                  value={field.value}
                  onChange={field.onChange}
                  options={Array.from({ length: currentYear - 1919 }, (_, i) => ({
                    value: String(currentYear - i),
                    label: String(currentYear - i),
                  }))}
                  error={!!errors.dobYear}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Father's name */}
      <Input
        label={t('basics.father')}
        placeholder={t('basics.father.placeholder')}
        error={errors.fatherName?.message}
        autoComplete="off"
        {...register('fatherName', { required: t('basics.required') })}
      />

      {/* Mother's name */}
      <Input
        label={t('basics.mother')}
        placeholder={t('basics.mother.placeholder')}
        error={errors.motherName?.message}
        autoComplete="off"
        {...register('motherName', { required: t('basics.required') })}
      />

      <Button type="submit" variant="primary" size="lg" pill className="w-full mt-2">
        {t('nav.continue')}
      </Button>
    </form>
  );
}

function SelectDropdown({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-3 text-base bg-paper border rounded-xl
          text-ink appearance-none cursor-pointer min-h-[52px]
          focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 ring-fade
          transition-colors duration-200 font-sans
          ${error ? 'border-rose' : 'border-border-soft'}`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-hint">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
