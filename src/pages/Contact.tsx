import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for contacting DTEx! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const offices = [
    {
      city: 'Shanghai (Regional HQ)',
      address: '288 Pudong Avenue, Pudong, Shanghai 200120, China',
      phone: '+86 21 5566 8800',
      email: 'shanghai@dtexlogistics.com'
    },
    {
      city: 'Shenzhen',
      address: '120 Nanshan Logistics Park, Nanshan District, Shenzhen 518000, China',
      phone: '+86 755 6677 8801',
      email: 'shenzhen@dtexlogistics.com'
    },
    {
      city: 'Los Angeles',
      address: '1450 Harbor Gateway, Los Angeles, CA 90731, USA',
      phone: '+1 310 555 0182',
      email: 'la@dtexlogistics.com'
    },
    {
      city: 'Ho Chi Minh City',
      address: '88 Nguyen Van Linh, District 7, Ho Chi Minh City, Vietnam',
      phone: '+84 28 7777 8803',
      email: 'hcmc@dtexlogistics.com'
    }
  ];

  const contactMethods = [
    {
      icon: <Phone className="h-8 w-8 text-orange-500" />,
      title: 'Call Us',
      description: 'Speak with our customer service team',
      contact: '+1 888 555 0199',
      availability: '24/7 Global Customer Support'
    },
    {
      icon: <Mail className="h-8 w-8 text-orange-500" />,
      title: 'Email Us',
      description: 'Send us your queries and feedback',
      contact: 'support@dtexlogistics.com',
      availability: 'Response within 2 business hours'
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-orange-500" />,
      title: 'Live Chat',
      description: 'Chat with our support agents',
      contact: 'Available on website',
      availability: 'Mon-Sun, 8 AM - 10 PM'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Get in touch with DTEx for all your China-USA-Vietnam logistics and shipping needs
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Choose your preferred way to reach us
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-6">{method.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className="text-lg font-semibold text-blue-600 mb-2">{method.contact}</p>
                <p className="text-sm text-gray-500">{method.availability}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="quote">Request Quote</option>
                      <option value="support">Customer Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="complaint">Complaint</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center transition-colors duration-200"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Office Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Offices</h3>
              <div className="space-y-6">
                {offices.map((office, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">{office.city}</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                        <span className="text-gray-600">{office.address}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-orange-500" />
                        <span className="text-gray-600">{office.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-orange-500" />
                        <span className="text-gray-600">{office.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-2" />
                  Business Hours
                </h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
                      <span>Customer Support:</span>
                      <span className="text-orange-500">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">What are your delivery timeframes?</h4>
                <p className="text-gray-600">Express delivery: Same day or next day. Standard delivery: 2-5 business days depending on location.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Do you provide packaging materials?</h4>
                <p className="text-gray-600">Yes, we provide high-quality packaging materials and can handle packaging for fragile or special items.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">What is your coverage area?</h4>
                <p className="text-gray-600">We operate across major cities in China, the USA, and Vietnam, and provide international shipping to 200+ countries.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">How can I track my package?</h4>
                <p className="text-gray-600">You can track your package using our tracking number on our website or mobile app. We also send SMS and email updates.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept cash on pickup, online payments, credit/debit cards, bank transfers, and ACH/wire payments.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Do you offer insurance for shipments?</h4>
                <p className="text-gray-600">Yes, we offer comprehensive insurance coverage for valuable shipments at competitive rates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
