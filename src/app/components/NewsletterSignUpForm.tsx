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
    const res = await fetch("/api/subscribe-user", {
      body: JSON.stringify({ email: this.state.email }),
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
    });

    const json_res = await res.json();
    toast.success(json_res.message);

    this.setState({
      email: "",
    });
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
          className="w-full min-w-0 appearance-none rounded-md border-1 border-slate-500 bg-white px-4 py-2 text-base text-gray-900 shadow-sm placeholder:text-gray-400 "
        />
        <button
          type="submit"
          id="newsletter-btn"
          name="subscribe"
          className="ml-2 m-2 text-white py-2 px-4 rounded-md bg-slate-500 hover:bg-slate-700 transition duration-300 ease-in-out"
        >
          הרשמה
        </button>
      </form>
    );
  }
}

export default ConvertkitEmailForm;
