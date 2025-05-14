import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="container">
          <h1 className="display-3 font-serif mb-4">Gourmet Haven</h1>
          <p className="lead mb-5">Experience culinary excellence in an elegant atmosphere</p>
          <Link href="/reserve" className="btn btn-primary btn-lg">
            Reserve a Table
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="position-relative" style={{ height: '400px' }}>
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600&auto=format&fit=crop"
                  alt="Restaurant Interior"
                  className="rounded shadow w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="font-serif mb-4">About Our Restaurant</h2>
              <p className="lead">
                Welcome to Gourmet Haven, where culinary artistry meets warm hospitality.
              </p>
              <p>
                Established in 2010, our restaurant has been serving exquisite dishes crafted from the finest locally-sourced ingredients. Our team of award-winning chefs combines traditional techniques with innovative approaches to create unforgettable dining experiences.
              </p>
              <p>
                The elegant yet comfortable atmosphere makes Gourmet Haven perfect for romantic dinners, family celebrations, or business meetings. Our attentive staff ensures that every visit is special.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center font-serif mb-5">Featured Menu</h2>
          <div className="row">
            {/* Menu Item 1 */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative" style={{ height: '200px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1532980193509-0e4e7e0b4f40?q=80&w=400&auto=format&fit=crop"
                    alt="Seared Scallops"
                    className="card-img-top h-100 w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title font-serif">Seared Scallops</h5>
                  <p className="card-text text-muted">
                    Pan-seared scallops with cauliflower purée, crispy pancetta, and truffle oil
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Item 2 */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative" style={{ height: '200px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop"
                    alt="Braised Short Rib"
                    className="card-img-top h-100 w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title font-serif">Braised Short Rib</h5>
                  <p className="card-text text-muted">
                    Slow-braised beef short rib with root vegetable purée and red wine reduction
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Item 3 */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative" style={{ height: '200px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=400&auto=format&fit=crop"
                    alt="Chocolate Soufflé"
                    className="card-img-top h-100 w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title font-serif">Chocolate Soufflé</h5>
                  <p className="card-text text-muted">
                    Warm chocolate soufflé with vanilla bean ice cream and raspberry coulis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center font-serif mb-5">What Our Guests Say</h2>
          <div className="row">
            {/* Testimonial 1 */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-quote fs-1 text-primary mb-3"></i>
                  <p className="card-text">
                    "The food was exceptional and the service impeccable. The ambiance created the perfect setting for our anniversary dinner."
                  </p>
                  <div className="mt-3">
                    <h5 className="card-title mb-0 font-serif">Emily & James</h5>
                    <small className="text-muted">Celebrating 5 years</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-quote fs-1 text-primary mb-3"></i>
                  <p className="card-text">
                    "Every dish was a work of art, both visually and in flavor. The chef's tasting menu was a culinary journey I won't soon forget."
                  </p>
                  <div className="mt-3">
                    <h5 className="card-title mb-0 font-serif">Michael R.</h5>
                    <small className="text-muted">Food critic</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-quote fs-1 text-primary mb-3"></i>
                  <p className="card-text">
                    "We hosted our company dinner here and everyone was impressed. The staff accommodated our large group with ease and professionalism."
                  </p>
                  <div className="mt-3">
                    <h5 className="card-title mb-0 font-serif">Sarah T.</h5>
                    <small className="text-muted">Corporate event</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container">
          <h2 className="font-serif mb-4">Ready to Experience Gourmet Haven?</h2>
          <p className="lead mb-4">
            Reserve your table today and embark on a culinary journey
          </p>
          <Link href="/reserve" className="btn btn-light btn-lg">
            Make a Reservation
          </Link>
        </div>
      </section>
    </>
  );
}
