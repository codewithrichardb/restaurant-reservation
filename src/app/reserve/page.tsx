import ReservationForm from '@/components/reservation/ReservationForm';

export const metadata = {
  title: 'Make a Reservation - Gourmet Haven',
  description: 'Reserve a table at Gourmet Haven restaurant',
};

export default function ReservationPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="text-center font-serif mb-4">Reserve Your Table</h1>
          <p className="text-center text-muted mb-5">
            Complete the form below to book your dining experience at Gourmet Haven.
            For parties larger than 12, please call us directly at (555) 123-4567.
          </p>
          
          <ReservationForm />
          
          <div className="mt-5">
            <h3 className="font-serif mb-3">Reservation Policies</h3>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <ul className="mb-0">
                  <li className="mb-2">Reservations can be made up to 30 days in advance.</li>
                  <li className="mb-2">We hold reservations for 15 minutes past the reserved time.</li>
                  <li className="mb-2">For cancellations, please notify us at least 24 hours in advance.</li>
                  <li className="mb-2">A credit card is not required to secure your reservation.</li>
                  <li>For special events or large parties (more than 12 people), please contact us directly.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
