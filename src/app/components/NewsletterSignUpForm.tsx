"use client";
import React, { Component } from "react";
import toast from "react-hot-toast";

class ConvertkitEmailForm extends Component {
  state = {
    email: "",
  };

  emailHandler = (e: any) => {
    let updatedEmail = e.target.value;
    this.setState({ email: updatedEmail });
  };

  subscribeUser = async (e: any) => {
    e.preventDefault();
    
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
        toast.success(json_res.message);
        
        this.setState({
          email: "",
        });
      } else {
        toast.error(json_res.error || 'שגיאה ברישום לניוזלטר');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('שגיאה ברישום לניוזלטר. אנא נסה שוב.', {
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
  };

  render() {
    return (
      <form
        className="flex items-center mt-6 sm:flex sm:max-w-md lg:mt-0"
        onSubmit={this.subscribeUser}
      >
        <input
          type="email"
          name="email"
          id="newsletter-input"
          autoComplete="email"
          placeholder="הכניסו את האימייל שלכם"
          value={this.state.email}
          onChange={this.emailHandler}
          autoCorrect="off"
          autoCapitalize="off"
          required
          className="w-full min-w-0 appearance-none rounded-md border-1 border-[#D9C5B3] bg-white px-4 py-2 text-base text-[#5D5D5D] shadow-sm placeholder:text-[#8A8A8A] focus:border-[#B56B4A] focus:outline-none focus:ring-1 focus:ring-[#B56B4A]"
        />
        <button
          type="submit"
          id="newsletter-btn"
          name="subscribe"
          className="ml-2 m-2 text-white py-2 px-4 rounded-md bg-[#B56B4A] hover:bg-[#D9845E] transition duration-300 ease-in-out"
        >
          הרשמה
        </button>
      </form>
    );
  }
}

export default ConvertkitEmailForm;
