"use client";
import React, { Component } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

class ConvertkitEmailForm extends Component {
  state = {
    email: "",
    isLoading: false,
    isFocused: false,
  };

  emailHandler = (e: any) => {
    let updatedEmail = e.target.value;
    this.setState({ email: updatedEmail });
  };

  subscribeUser = async (e: any) => {
    e.preventDefault();
    
    if (this.state.isLoading) return;
    
    this.setState({ isLoading: true });
    
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        body: JSON.stringify({ 
          email: this.state.email,
          source: "footer" // Track where subscription came from
        }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "POST",
      });

      const json_res = await res.json();
      
      if (res.ok) {
        toast.success('📧 נרשמת בהצלחה לניוזלטר! נשמח לשתף אותך בעדכונים', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: 'linear-gradient(135deg, #B56B4A, #D9845E)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(181, 107, 74, 0.3)'
          }
        });
        
        this.setState({
          email: "",
        });
      } else {
        toast.error(json_res.error || '❌ אירעה שגיאה ברישום לנייוזלטר - אנא נסה שוב', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#f87171',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '16px'
          }
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('❌ אירעה שגיאה ברישום לניוזלטר - אנא נסה שוב', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#f87171',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '16px'
        }
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { email, isLoading, isFocused } = this.state;
    
    return (
      <motion.form
        className="space-y-4"
        onSubmit={this.subscribeUser}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Input Field */}
        <motion.div 
          className="relative group"
          whileHover={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <motion.input
            type="email"
            name="email"
            id="newsletter-input"
            autoComplete="email"
            placeholder="הכניסו את האימייל שלכם"
            value={email}
            onChange={this.emailHandler}
            onFocus={() => this.setState({ isFocused: true })}
            onBlur={() => this.setState({ isFocused: false })}
            autoCorrect="off"
            autoCapitalize="off"
            required
            disabled={isLoading}
            className={`
              w-full px-4 py-3 text-base text-[#2D3142] bg-white/90 backdrop-blur-sm
              border-2 rounded-xl transition-all duration-300 ease-in-out
              placeholder:text-[#8A8A8A] placeholder:text-right
              focus:outline-none focus:ring-0 focus:scale-[1.02]
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-sm hover:shadow-md
              ${isFocused 
                ? 'border-[#B56B4A] bg-white shadow-md shadow-[#B56B4A]/20' 
                : 'border-[#D5C4B7] hover:border-[#B8A99C]'
              }
            `}
            style={{
              textAlign: 'right',
              direction: 'rtl'
            }}
          />
          
          {/* Animated border effect */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-[#B56B4A] opacity-0 pointer-events-none"
            animate={{
              opacity: isFocused ? 0.3 : 0,
              scale: isFocused ? 1.05 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Enhanced Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !email.trim()}
          className={`
            w-full py-3 px-6 rounded-xl font-semibold text-base
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-4 focus:ring-[#B56B4A]/30
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-md hover:shadow-lg
            ${
              isLoading || !email.trim()
                ? 'bg-[#D5C4B7] text-[#8A8A8A] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#B56B4A] to-[#D9845E] text-white hover:from-[#A25539] hover:to-[#C7734D] active:scale-95'
            }
          `}
          whileHover={!isLoading && email.trim() ? { y: -2, opacity: 0.9 } : {}}
          whileTap={!isLoading && email.trim() ? { scale: 0.98 } : {}}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse"
            animate={isLoading ? { opacity: 0.7 } : { opacity: 1 }}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  // Removed infinite animation to prevent CPU/GPU overheating
                />
                <span>נרשם...</span>
              </>
            ) : (
              <>
                <span>הירשמו לניוזלטר</span>
                <motion.span
                  className="text-lg"
                  animate={{ x: [0, 5, 0] }}
                  // Removed infinite animation to prevent CPU/GPU overheating
                >
                  ←
                </motion.span>
              </>
            )}
          </motion.div>
        </motion.button>

        {/* Success/Error indicator */}
        <motion.div
          className="text-center text-sm text-[#2D3142]/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ✨ קבלו עדכונים על שיעורים חדשים וטיפים בלעדיים
        </motion.div>
      </motion.form>
    );
  }
}

export default ConvertkitEmailForm;
