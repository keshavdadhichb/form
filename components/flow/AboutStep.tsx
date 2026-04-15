'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/lib/i18n';
import { useFormStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

interface AboutStepProps {
  onNext: () => void;
}

interface FormValues {
  qualifications: string;
  achievements: string;
  hobbies: string;
}

export default function AboutStep({ onNext }: AboutStepProps) {
  const { t } = useTranslation();
  const { qualifications, achievements, hobbies, setAbout } = useFormStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { qualifications, achievements, hobbies },
  });

  const watched = watch();
  useEffect(() => {
    setAbout({
      qualifications: watched.qualifications ?? '',
      achievements: watched.achievements ?? '',
      hobbies: watched.hobbies ?? '',
    });
  }, [watched.qualifications, watched.achievements, watched.hobbies]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      onSubmit={handleSubmit(onNext)}
      className="flex flex-col gap-7 px-6 py-8 max-w-md mx-auto w-full"
    >
      <h2
        className="text-2xl text-ink text-center mb-2"
        style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
      >
        {t('about.heading')}
      </h2>

      <Textarea
        label={t('about.qualifications')}
        placeholder={t('about.qualifications.placeholder')}
        hint={t('about.qualifications.hint')}
        error={errors.qualifications?.message}
        minRows={3}
        {...register('qualifications', { required: t('basics.required') })}
      />

      <Textarea
        label={t('about.achievements')}
        placeholder={t('about.achievements.placeholder')}
        hint={t('about.achievements.hint')}
        error={errors.achievements?.message}
        minRows={3}
        {...register('achievements', { required: t('basics.required') })}
      />

      <Textarea
        label={t('about.hobbies')}
        placeholder={t('about.hobbies.placeholder')}
        hint={t('about.hobbies.hint')}
        error={errors.hobbies?.message}
        minRows={3}
        {...register('hobbies', { required: t('basics.required') })}
      />

      <Button type="submit" variant="primary" size="lg" pill className="w-full mt-2">
        {t('nav.continue')}
      </Button>
    </form>
  );
}
