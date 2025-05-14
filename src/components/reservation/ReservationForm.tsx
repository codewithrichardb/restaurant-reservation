'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchTimeSlots, createReservation } from '@/api/reservations';
import { ReservationFormData, TimeSlot, MenuItem, PreOrderItem, SpecialOccasion } from '@/types';

// Function to fetch menu items
const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const response = await fetch('/api/menu?available=true');
  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }
  return response.json();
};

export default function ReservationForm() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [step, setStep] = useState(1);
  const [showPreOrder, setShowPreOrder] = useState(false);

  // Query for time slots
  const { data: availableTimeSlots = [], isLoading } = useQuery({
    queryKey: ['timeSlots', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: () => selectedDate ? fetchTimeSlots(format(selectedDate, 'yyyy-MM-dd')) : Promise.resolve([]),
    enabled: !!selectedDate,
  });

  // Query for menu items (for pre-ordering)
  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
    enabled: showPreOrder,
  });

  // State for pre-order items
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);

  // Mutation for creating a reservation
  const createMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (data) => {
      router.push(`/reserve/confirmation?id=${data._id}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReservationFormData>();

  const selectedTimeSlot = watch('timeSlot');
  const selectedPartySize = watch('partySize');

  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      setValue('date', formattedDate);
    }
  };

  // Add a pre-order item
  const addPreOrderItem = (item: string) => {
    const existingItem = preOrderItems.find(i => i.item === item);
    if (existingItem) {
      // Update quantity if item already exists
      setPreOrderItems(preOrderItems.map(i =>
        i.item === item ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      // Add new item
      setPreOrderItems([...preOrderItems, { item, quantity: 1 }]);
    }
  };

  // Remove a pre-order item
  const removePreOrderItem = (item: string) => {
    const existingItem = preOrderItems.find(i => i.item === item);
    if (existingItem && existingItem.quantity > 1) {
      // Decrease quantity if more than 1
      setPreOrderItems(preOrderItems.map(i =>
        i.item === item ? { ...i, quantity: i.quantity - 1 } : i
      ));
    } else {
      // Remove item completely
      setPreOrderItems(preOrderItems.filter(i => i.item !== item));
    }
  };

  // Update special instructions for a pre-order item
  const updateSpecialInstructions = (item: string, instructions: string) => {
    setPreOrderItems(preOrderItems.map(i =>
      i.item === item ? { ...i, specialInstructions: instructions } : i
    ));
  };

  // Handle form submission
  const onSubmit: SubmitHandler<ReservationFormData> = (data) => {
    // Include pre-order items if any
    if (preOrderItems.length > 0) {
      data.preOrders = preOrderItems;
    }

    createMutation.mutate(data);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2 className="card-title font-serif text-center mb-4">Make a Reservation</h2>

        {step === 1 && (
          <div>
            <div className="mb-4">
              <label className="form-label">Select Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                className="form-control"
                placeholderText="Select a date"
                required
              />
              {!selectedDate && (
                <div className="text-danger small mt-1">Please select a date</div>
              )}
            </div>

            {selectedDate && (
              <>
                <div className="mb-4">
                  <label className="form-label">Party Size</label>
                  <select
                    className={`form-select ${errors.partySize ? 'is-invalid' : ''}`}
                    {...register('partySize', { required: true })}
                  >
                    <option value="">Select party size</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((size) => (
                      <option key={size} value={size}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                  {errors.partySize && (
                    <div className="invalid-feedback">Please select party size</div>
                  )}
                </div>

                {selectedPartySize && (
                  <div className="mb-4">
                    <label className="form-label">Select Time</label>
                    <div className="d-flex flex-wrap gap-2">
                      {isLoading ? (
                        <div className="text-center w-100 py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        availableTimeSlots.map((slot) => (
                          <button
                            key={slot._id}
                            type="button"
                            className={`btn ${
                              selectedTimeSlot === slot.time
                                ? 'btn-primary'
                                : slot.available
                                ? 'btn-outline-primary'
                                : 'btn-outline-secondary'
                            }`}
                            disabled={!slot.available}
                            onClick={() => setValue('timeSlot', slot.time)}
                          >
                            {slot.time}
                          </button>
                        ))
                      )}
                    </div>
                    {!selectedTimeSlot && availableTimeSlots.length > 0 && (
                      <div className="text-danger small mt-1">Please select a time</div>
                    )}
                    {availableTimeSlots.length === 0 && (
                      <div className="alert alert-warning mt-2">
                        No available time slots for the selected date. Please choose another date.
                      </div>
                    )}
                  </div>
                )}

                {selectedTimeSlot && (
                  <div className="d-grid mt-4">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <div className="alert alert-info">
                <strong>Reservation Details:</strong>
                <br />
                Date: {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                <br />
                Time: {selectedTimeSlot}
                <br />
                Party Size: {selectedPartySize} {Number(selectedPartySize) === 1 ? 'person' : 'people'}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                {...register('name', { required: true })}
              />
              {errors.name && (
                <div className="invalid-feedback">Please enter your name</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                {...register('email', {
                  required: true,
                  pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">
                  Please enter a valid email address
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                id="phone"
                {...register('phone', { required: true })}
              />
              {errors.phone && (
                <div className="invalid-feedback">
                  Please enter your phone number
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="specialOccasion" className="form-label">
                Special Occasion (Optional)
              </label>
              <select
                className="form-select"
                id="specialOccasion"
                {...register('specialOccasion')}
              >
                <option value="">None</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Business">Business Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="occasionDetails" className="form-label">
                Occasion Details (Optional)
              </label>
              <textarea
                className="form-control"
                id="occasionDetails"
                rows={2}
                placeholder="e.g., Celebrating a 30th birthday"
                {...register('occasionDetails')}
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="specialRequests" className="form-label">
                Special Requests (Optional)
              </label>
              <textarea
                className="form-control"
                id="specialRequests"
                rows={3}
                placeholder="e.g., Allergies, dietary restrictions, seating preferences"
                {...register('specialRequests')}
              ></textarea>
            </div>

            <div className="mb-4">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="preOrderToggle"
                  checked={showPreOrder}
                  onChange={(e) => setShowPreOrder(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="preOrderToggle">
                  Pre-order food (optional)
                </label>
              </div>

              {showPreOrder && (
                <div className="mt-3 border rounded p-3">
                  <h5 className="mb-3">Pre-order Menu</h5>

                  {isLoadingMenu ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading menu...</span>
                      </div>
                    </div>
                  ) : menuItems.length === 0 ? (
                    <div className="alert alert-info">
                      No menu items available for pre-order.
                    </div>
                  ) : (
                    <>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="accordion mb-3">
                            {['Appetizer', 'Main Course', 'Dessert', 'Beverage'].map((category) => {
                              const categoryItems = menuItems.filter(item => item.category === category);
                              if (categoryItems.length === 0) return null;

                              return (
                                <div className="accordion-item" key={category}>
                                  <h2 className="accordion-header">
                                    <button
                                      className="accordion-button collapsed"
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#collapse${category.replace(' ', '')}`}
                                    >
                                      {category}
                                    </button>
                                  </h2>
                                  <div
                                    id={`collapse${category.replace(' ', '')}`}
                                    className="accordion-collapse collapse"
                                  >
                                    <div className="accordion-body">
                                      <div className="list-group">
                                        {categoryItems.map((item) => (
                                          <div key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                              <h6 className="mb-0">{item.name}</h6>
                                              <small className="text-muted">${item.price.toFixed(2)}</small>
                                              <p className="small mb-0">{item.description}</p>
                                            </div>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => addPreOrderItem(item.name)}
                                            >
                                              Add
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="card">
                            <div className="card-header">
                              <h5 className="mb-0">Your Pre-order</h5>
                            </div>
                            <div className="card-body">
                              {preOrderItems.length === 0 ? (
                                <p className="text-muted">No items added yet.</p>
                              ) : (
                                <ul className="list-group list-group-flush">
                                  {preOrderItems.map((item, index) => (
                                    <li key={index} className="list-group-item px-0">
                                      <div className="d-flex justify-content-between">
                                        <span>{item.item}</span>
                                        <div>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger me-1"
                                            onClick={() => removePreOrderItem(item.item)}
                                          >
                                            -
                                          </button>
                                          <span className="mx-1">{item.quantity}</span>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-success ms-1"
                                            onClick={() => addPreOrderItem(item.item)}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div className="mt-2">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Special instructions"
                                          value={item.specialInstructions || ''}
                                          onChange={(e) => updateSpecialInstructions(item.item, e.target.value)}
                                        />
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary flex-grow-1"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-grow-1"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  'Complete Reservation'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
