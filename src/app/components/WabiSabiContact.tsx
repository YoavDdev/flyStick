"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WabiSabiContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        toast.success('הודעתך נשלחה בהצלחה! נחזור אליך בהקדם.');
      } else {
        toast.error(result.error || 'שגיאה בשליחת ההודעה. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('Error sending contact email:', error);
      toast.error('שגיאה בשליחת ההודעה. אנא בדוק את החיבור לאינטרנט ונסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = `אל תהססו לפנות בשאלות, בקשות מיוחדות או סתם להגיד שלום.

אני כאן כדי לדייק ולעזור עם כל מידע שאתם צריכים.

בין אם זה שאלות שעלו מהשיעורים, או שיתוף פעולה והגעה אליכם. שלחו אלי הודעת וואטצאפ ואעשה את כל המאמצים לשוב אליכם בהקדם.

המשוב והתקשורת ביננו חשובים לי מאד. בואו נהיה בקשר!`;

  const handleWhatsAppClick = () => {
    const phoneNumber = '972527061212'; // Actual WhatsApp number
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="Contact" className="relative py-20 overflow-hidden">
      {/* Subtle overlay for readability over desert background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#F5F1EB', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
            צרו קשר
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#F5F1EB', textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)', opacity: '0.9' }}>
            יש לכם שאלות? רוצים לדעת יותר על השיעורים? אנחנו כאן בשבילכם. צרו קשר ונחזור אליכם במהירות.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* WhatsApp Contact */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="text-center lg:text-right">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 mx-auto lg:mx-0"
                style={{ backgroundColor: '#25D366' }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaWhatsapp className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-semibold mb-6" style={{ color: '#F5F1EB', textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                בואו נהיה בקשר
              </h3>
              
              <div className="space-y-4 mb-8 text-right">
                {whatsappMessage.split('\n\n').map((paragraph, index) => (
                  <motion.p
                    key={index}
                    className="text-base leading-relaxed"
                    style={{ color: '#F5F1EB', textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)', opacity: '0.9' }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
              
              <motion.button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 space-x-3 rtl:space-x-reverse"
                style={{ backgroundColor: '#25D366' }}
                whileHover={{ scale: 1.05, backgroundColor: '#22C55E' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>שלחו הודעה בוואטסאפ</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="p-8 rounded-3xl backdrop-blur-sm border" style={{ 
              backgroundColor: 'rgba(245, 241, 235, 0.1)',
              borderColor: 'rgba(245, 241, 235, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <h3 className="text-2xl font-semibold mb-6" style={{ color: '#F5F1EB', textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                שלחו לנו הודעה
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#F5F1EB' }}>
                      שם מלא *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ 
                        borderColor: '#D5C4B7',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                      onFocus={(e) => e.currentTarget.style.outline = '2px solid #B8A99C'}
                      onBlur={(e) => e.currentTarget.style.outline = 'none'}
                      placeholder="הכניסו את שמכם"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#F5F1EB' }}>
                      טלפון
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ 
                        borderColor: '#D5C4B7',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                      onFocus={(e) => e.currentTarget.style.outline = '2px solid #B8A99C'}
                      onBlur={(e) => e.currentTarget.style.outline = 'none'}
                      placeholder="מספר טלפון"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#F5F1EB' }}>
                    אימייל *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ 
                      borderColor: '#D5C4B7',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onFocus={(e) => e.currentTarget.style.outline = '2px solid #B8A99C'}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                    placeholder="כתובת האימייל שלכם"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#F5F1EB' }}>
                    הודעה *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 resize-none"
                    style={{ 
                      borderColor: '#D5C4B7',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onFocus={(e) => e.currentTarget.style.outline = '2px solid #B8A99C'}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                    placeholder="כתבו לנו את השאלה או ההודעה שלכם..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  style={{ backgroundColor: '#F5F1EB', color: '#2D3142' }}
                  whileHover={{ scale: 1.02, backgroundColor: '#E8DDD0' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      <span>שלח הודעה</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WabiSabiContact;
