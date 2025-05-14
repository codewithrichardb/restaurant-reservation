'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { addToWaitlist } from '@/api/admin';

type WaitlistFormData = {
  name: string;
  email: string;
  phone: string;
  partySize: number;
};

export default function JoinWaitlistPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      partySize: 2,
    },
  });
  
  // Add to waitlist mutation
  const addToWaitlistMutation = useMutation({
    mutationFn: addToWaitlist,
    onSuccess: () => {
      setSuccess(true);
      reset();
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    },
  });
  
  // Handle form submission
  const onSubmit: SubmitHandler<WaitlistFormData> = (data) => {
    addToWaitlistMutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      partySize: data.partySize,
    });
  };
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title font-serif text-center mb-4">Join Our Waitlist</h1>
              
              {success ? (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 className="mb-3">You've been added to the waitlist!</h3>
                  <p className="mb-4">We'll notify you when your table is ready.</p>
                  <Link href="/" className="btn btn-primary">
                    Return to Home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name.message}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        }
                      })}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email.message}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      placeholder="(123) 456-7890"
                      {...register('phone', { 
                        required: 'Phone number is required',
                      })}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone.message}</div>
                    )}
                    <div className="form-text">
                      We'll use this to notify you when your table is ready.
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="partySize" className="form-label">Party Size</label>
                    <select
                      className={`form-select ${errors.partySize ? 'is-invalid' : ''}`}
                      id="partySize"
                      {...register('partySize', { 
                        required: 'Party size is required',
                        min: {
                          value: 1,
                          message: 'Party size must be at least 1',
                        },
                        max: {
                          value: 20,
                          message: 'For parties larger than 20, please call us directly',
                        }
                      })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((size) => (
                        <option key={size} value={size}>
                          {size} {size === 1 ? 'person' : 'people'}
                        </option>
                      ))}
                    </select>
                    {errors.partySize && (
                      <div className="invalid-feedback">{errors.partySize.message}</div>
                    )}
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={addToWaitlistMutation.isPending}
                    >
                      {addToWaitlistMutation.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding to Waitlist...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                    <Link href="/" className="btn btn-outline-secondary">
                      Cancel
                    </Link>
                  </div>
                  
                  {addToWaitlistMutation.isError && (
                    <div className="alert alert-danger mt-3">
                      Error joining waitlist. Please try again.
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p>
              Prefer to make a reservation instead?{' '}
              <Link href="/reserve" className="text-decoration-none">
                Book a Table
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
