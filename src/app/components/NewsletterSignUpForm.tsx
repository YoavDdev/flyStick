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
        className="mt-6 sm:flex sm:max-w-md lg:mt-0"
        onSubmit={this.subscribeUser}
      >
        <input
          type="email"
          name="email"
          id="newsletter-input"
          autoComplete="email"
          placeholder="הכנס את אימייל שלך"
          value={this.state.email}
          onChange={this.emailHandler}
          autoCorrect="off"
          autoCapitalize="off"
          required
          className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:w-56 sm:text-sm sm:leading-6"
        />
        <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
          <button
            type="submit"
            id="newsletter-btn"
            value=""
            name="subscribe"
            className="rounded-full bg-[#2D3142] px-6 py-3 text-lg text-white shadow-lg hover:bg-[#4F5D75] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            הרשמה
          </button>
        </div>
      </form>
    );
  }
}

export default ConvertkitEmailForm;
