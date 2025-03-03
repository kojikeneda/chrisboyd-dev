---
title: "Contact"
date: 2023-01-01
draft: false
---

# Get in Touch

Feel free to reach out to me through any of the following channels:

- Email: [chrisboyd@gmail.com](mailto:chrisboyd@gmail.com)
- [GitHub](https://github.com/kojikeneda)
- [LinkedIn](https://linkedin.com/in/chris-boyd-365b2220/)
- [Twitter](https://twitter.com/yourusername)

Or use the form below:

<style>
  form.contact-form input, form.contact-form textarea {
    color: #000;
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 0.5em;
    font-size: 1em;
    width: 100%;
    box-sizing: border-box;
  }
  form.contact-form label {
    display: block;
    margin-top: 1em;
    font-weight: bold;
  }
  form.contact-form button {
    margin-top: 1em;
    padding: 0.7em 1.2em;
    background-color: #007acc;
    color: #fff;
    border: none;
    cursor: pointer;
  }
  form.contact-form button:hover {
    background-color: #005fa3;
  }
</style>

<form class="contact-form" action="https://formspree.io/f/mgejdwao" method="POST" onsubmit="return trackFormSubmit(event);">
  <label for="email">Your email:</label>
  <input type="email" name="email" id="email" required>
  
  <label for="message">Your message:</label>
  <textarea name="message" id="message" rows="5" required></textarea>
  
  <button type="submit">Send</button>
</form>

<script>
  function trackFormSubmit(event) {
    // Example: send an event to Google Analytics if available
    if (window.gtag) {
      gtag('event', 'submit', {
        'event_category': 'Contact Form',
        'event_label': 'Contact Form Submission'
      });
    }
    // Additional analytics integration can be added here.
    return true;
  }
</script>