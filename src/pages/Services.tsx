import React from 'react';
import { Clock, Shield, Globe, Truck, Package, Zap, Building, Plane, Ship, Box } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Zap className="h-12 w-12 text-orange-500" />,
      title: 'Express Delivery',
      description: 'Same-day and next-day delivery for urgent shipments across major cities in China, the USA, and Vietnam.',
      features: ['Same-day delivery', 'Next-day delivery', 'Priority handling', 'Real-time tracking'],
      price: 'Starting from $8'
    },
    {
      icon: <Clock className="h-12 w-12 text-orange-500" />,
      title: 'Standard Delivery',
      description: 'Cost-effective delivery solution with 2-5 business days delivery time.',
      features: ['2-5 business days', 'Weight up to 20kg', 'SMS & email updates', 'Proof of delivery'],
      price: 'Starting from $4'
    },
    {
      icon: <Globe className="h-12 w-12 text-orange-500" />,
      title: 'International Shipping',
      description: 'Reliable international courier services to 200+ countries worldwide.',
      features: ['200+ countries', 'Customs clearance', 'Door-to-door delivery', 'Documentation support'],
      price: 'Starting from $49'
    },
    {
      icon: <Building className="h-12 w-12 text-orange-500" />,
      title: 'E-commerce Logistics',
      description: 'Complete fulfillment solutions for online businesses and marketplaces.',
      features: ['Warehousing', 'Order processing', 'Returns management', 'API integration'],
      price: 'Custom pricing'
    },
    {
      icon: <Truck className="h-12 w-12 text-orange-500" />,
      title: 'Bulk Shipping',
      description: 'Cost-effective solutions for large volume shipments and B2B deliveries.',
      features: ['Volume discounts', 'Dedicated support', 'Flexible pickup', 'Custom packaging'],
      price: 'Volume-based pricing'
    },
    {
      icon: <Package className="h-12 w-12 text-orange-500" />,
      title: 'Special Handling',
      description: 'Specialized services for fragile, valuable, or temperature-sensitive items.',
      features: ['Fragile handling', 'Temperature control', 'High-value insurance', 'White glove delivery'],
      price: 'Starting from $12'
    }
  ];

  const additionalServices = [
    {
      icon: <Plane className="h-8 w-8 text-blue-500" />,
      title: 'Air Cargo',
      description: 'Fast air freight services for time-sensitive shipments'
    },
    {
      icon: <Ship className="h-8 w-8 text-blue-500" />,
      title: 'Sea Freight',
      description: 'Cost-effective ocean shipping for large volume cargo'
    },
    {
      icon: <Box className="h-8 w-8 text-blue-500" />,
      title: 'Warehousing',
      description: 'Secure storage and inventory management solutions'
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: 'Insurance',
      description: 'Comprehensive coverage for your valuable shipments'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive logistics solutions designed to meet all your shipping and delivery needs across China, the USA, and Vietnam
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Our Core Services
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our range of delivery options tailored to your specific requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-6">{service.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">{service.title}</h3>
                <p className="text-gray-600 mb-6 text-center">{service.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center pt-4 border-t border-gray-100">
                  <div className="text-lg font-semibold text-orange-500 mb-4">{service.price}</div>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600">
              Specialized solutions to complement your logistics needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Service Coverage
            </h2>
            <p className="text-xl text-gray-600">
              Extensive network across major gateways in China, the USA, and Vietnam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">60+</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Key Gateways</h3>
              <p className="text-gray-600">Top manufacturing, retail, and export hubs covered</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3K+</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Distribution Points</h3>
              <p className="text-gray-600">Dense urban and suburban last-mile coverage</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">200+</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Countries</h3>
              <p className="text-gray-600">International shipping worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Contact our experts to discuss your specific logistics requirements
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200">
            Contact Sales Team
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;
