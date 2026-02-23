import { Award, Globe, Target, Eye, Heart } from 'lucide-react';

const About = () => {
  const milestones = [
    { year: '2018', event: 'DTEx founded in Shanghai' },
    { year: '2019', event: 'Expanded to 10 major gateways across China' },
    { year: '2020', event: 'Launched US West Coast corridor' },
    { year: '2022', event: 'Vietnam fulfilment hub opened in HCMC' },
    { year: '2024', event: 'Tri-market network fully operational' },
    { year: '2025', event: '10 million+ packages delivered' },
  ];

  const values = [
    { icon: <Target className="h-8 w-8 text-orange-500" />, title: 'Reliability', description: 'We keep our promises and deliver on time, every time' },
    { icon: <Heart className="h-8 w-8 text-orange-500" />, title: 'Customer First', description: 'Our customers are at the heart of everything we do' },
    { icon: <Award className="h-8 w-8 text-orange-500" />, title: 'Excellence', description: 'We strive for excellence in every aspect of our service' },
    { icon: <Globe className="h-8 w-8 text-orange-500" />, title: 'Innovation', description: 'Embracing technology to provide better logistics solutions' },
  ];

  const team = [
    { name: 'Duy Thuc Huynh', position: 'CEO & Founder', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300', description: '12+ years in cross-border logistics' },
    { name: 'Li Wei', position: 'Chief Operations Officer', image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300', description: 'Expert in supply chain management' },
    { name: 'James Chen', position: 'Head of Technology', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', description: 'Leading digital transformation' },
    { name: 'Minh Tran', position: 'Customer Success Manager', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300', description: 'Ensuring customer satisfaction' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About DTEx</h1>
          <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Connecting China, the USA, and Vietnam with innovative cross-border logistics solutions
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                DTEx was founded in 2018 with a simple yet powerful vision: to revolutionize cross-border logistics by making reliable, fast, and affordable courier services accessible across the China-USA-Vietnam corridor.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Starting from our Shanghai headquarters, we have grown into a trusted tri-market logistics partner, serving millions of customers across three continents.
              </p>
              <p className="text-lg text-gray-600">
                Today, we pride ourselves on our extensive gateway network, cutting-edge technology, and most importantly, our commitment to delivering not just packages, but promises.
              </p>
            </div>
            <div>
              <img src="https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Logistics warehouse" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg h-full">
                <div className="flex items-center mb-6">
                  <Target className="h-10 w-10 text-orange-500 mr-4" />
                  <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
                </div>
                <p className="text-lg text-gray-600">
                  To provide reliable, efficient, and innovative logistics solutions that connect businesses and individuals across China, the USA, and Vietnam, enabling commerce and fostering economic growth.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg h-full">
                <div className="flex items-center mb-6">
                  <Eye className="h-10 w-10 text-blue-500 mr-4" />
                  <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
                </div>
                <p className="text-lg text-gray-600">
                  To be the leading cross-border logistics company in the Asia-Pacific region, recognized for our innovation, reliability, and commitment to customer success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index}>
                <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our growth story</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-orange-500" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index}>
                  <div className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-2xl font-bold text-orange-500 mb-2">{milestone.year}</div>
                        <div className="text-gray-800">{milestone.event}</div>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600">Meet the leaders driving our vision forward</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index}>
                <div className="text-center bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-orange-500 font-medium mb-2">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: '10M+', label: 'Packages Delivered' },
              { number: '60+', label: 'Key Gateways' },
              { number: '99.5%', label: 'On-time Delivery' },
              { number: '50K+', label: 'Happy Customers' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl mb-8 text-blue-100">
            Be part of the cross-border logistics revolution and experience the DTEx difference
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200">Start Shipping</button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors duration-200">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
