import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Globe, Truck, Package, Zap, Star } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Clock className="h-8 w-8 text-orange-500" />,
      title: 'Fast Delivery',
      description: 'Express delivery within 24 hours across major hubs in China, the USA, and Vietnam'
    },
    {
      icon: <Shield className="h-8 w-8 text-orange-500" />,
      title: 'Secure Shipping',
      description: 'End-to-end security and insurance coverage for all packages'
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-500" />,
      title: 'Tri-Market Network',
      description: 'Integrated network connecting China, the USA, and Vietnam with seamless cross-border routing'
    },
    {
      icon: <Package className="h-8 w-8 text-orange-500" />,
      title: 'Real-time Tracking',
      description: 'Track your packages in real-time with SMS and email updates'
    }
  ];

  const services = [
    {
      icon: <Zap className="h-12 w-12 text-blue-500" />,
      title: 'Express Delivery',
      description: 'Same-day and next-day delivery for urgent shipments'
    },
    {
      icon: <Globe className="h-12 w-12 text-blue-500" />,
      title: 'International Shipping',
      description: 'Reliable international courier services to 200+ countries'
    },
    {
      icon: <Truck className="h-12 w-12 text-blue-500" />,
      title: 'E-commerce Logistics',
      description: 'Complete fulfillment solutions for online businesses'
    }
  ];

  const stats = [
    { number: '10M+', label: 'Packages Delivered' },
    { number: '300+', label: 'Logistics Hubs' },
    { number: '120+', label: 'Cities Connected' },
    { number: '99.5%', label: 'On-time Delivery' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                DTEx
                <span className="text-orange-400"> Cross-Border Shipping Agency</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Fast, secure, and reliable logistics services across China, the USA, and Vietnam. From express delivery to international shipping, DTEx has you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/services"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center transition-colors duration-200"
                >
                  Our Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/track"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-800 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
                >
                  Track Package
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Logistics truck"
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Why Choose DTEx?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              With years of experience and cutting-edge technology, we deliver excellence in every shipment
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Our Core Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive logistics solutions tailored to your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="text-center p-8 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-6">{service.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <Link
                  to="/services"
                  className="text-orange-500 hover:text-orange-600 font-semibold flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg lg:text-xl opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Linh Tran',
                company: 'E-commerce Operations Manager',
                text: 'DTEx has been instrumental in our regional growth. Their reliable service and competitive rates make them our go-to logistics partner.'
              },
              {
                name: 'Jason Miller',
                company: 'US Retail Brand',
                text: 'The real-time tracking and customer support are exceptional. Our customers love the transparency and timely deliveries.'
              },
              {
                name: 'Chen Wei',
                company: 'Import/Export Business',
                text: 'For international shipments, DTEx provides unmatched service. Their documentation support is incredibly helpful.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Ship with DTEx?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust us with their deliveries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Get Quote
            </Link>
            <Link
              to="/services"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
