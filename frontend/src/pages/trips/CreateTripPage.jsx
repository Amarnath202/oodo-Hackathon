import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useTrips from '../../hooks/useTrips';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ROUTES } from '../../constants/routes.constants';
import styles from './CreateTripPage.module.css';

const schema = yup.object({
  name: yup.string().required('Trip name is required').min(2, 'Name is too short'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string()
    .required('End date is required')
    .test('after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return new Date(value) > new Date(startDate);
    }),
  description: yup.string().max(500, 'Max 500 characters'),
  budgetLimit: yup.number().transform((v) => (isNaN(v) ? undefined : v)).positive('Must be positive').nullable().optional(),
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

const CreateTripPage = () => {
  const { createTrip, uploadCover } = useTrips();
  const navigate = useNavigate();
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverError, setCoverError] = useState('');
  const fileRef = useRef();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setCoverError('Only JPG, PNG, or WebP files allowed');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setCoverError(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    setCoverError('');
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    try {
      const trip = await createTrip({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        budgetLimit: data.budgetLimit,
      });

      const tripId = trip.id || trip._id;

      if (coverFile && tripId) {
        try {
          await uploadCover(tripId, coverFile);
        } catch {
          toast.error('Trip created, but cover photo upload failed');
        }
      }

      navigate(ROUTES.ITINERARY_BUILDER_PATH(tripId));
    } catch {
      // Errors are already handled in the hook
    }
  };

  return (
    <div className={styles.page}>
      <div className="page-header">
        <h1 className="page-title">Create New Trip</h1>
        <p className="page-subtitle">Start planning your next adventure</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Cover Photo */}
          <div className={styles.coverSection}>
            <div
              className={styles.coverUpload}
              onClick={() => fileRef.current?.click()}
              style={{ backgroundImage: coverPreview ? `url(${coverPreview})` : undefined }}
            >
              {!coverPreview && (
                <div className={styles.coverPlaceholder}>
                  <span className={styles.coverIcon}>📸</span>
                  <p className={styles.coverText}>Click to add cover photo</p>
                  <p className={styles.coverHint}>JPG, PNG up to 5MB</p>
                </div>
              )}
              {coverPreview && (
                <div className={styles.coverOverlay}>
                  <span>Click to change</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {coverError && <ErrorMessage message={coverError} />}
          </div>

          <div className={styles.fields}>
            <Input
              label="Trip name"
              placeholder="e.g. Summer Europe Adventure"
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <div className={styles.row}>
              <Input
                label="Start date"
                type="date"
                error={errors.startDate?.message}
                required
                {...register('startDate')}
              />
              <Input
                label="End date"
                type="date"
                error={errors.endDate?.message}
                required
                {...register('endDate')}
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Describe your trip..."
              rows={3}
              hint="Optional — max 500 characters"
              error={errors.description?.message}
              {...register('description')}
            />

            <Input
              label="Budget limit"
              type="number"
              placeholder="0.00"
              hint="Optional — set a spending limit"
              error={errors.budgetLimit?.message}
              icon={<span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>₹</span>}
              {...register('budgetLimit')}
            />

            <div className={styles.actions}>
              <Button variant="ghost" type="button" onClick={() => navigate(ROUTES.TRIPS)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} size="lg">
                Create Trip & Build Itinerary →
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripPage;
