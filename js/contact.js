// Contact Us form. The site has no mail server, so a valid submission opens
// the visitor's email app with the message filled in, addressed to the office.
import { company, getProperty } from './data/properties.js';

// Arriving from a listing's "Request a showing" (contact.html?property=<id>):
// show that property as the property of interest. Plain visits stay as is.
const fromListing = getProperty(new URLSearchParams(location.search).get('property') || '');

const form = document.getElementById('contact-page-form');
const note = document.getElementById('contact-page-note');
if (fromListing) {
  const label = form.querySelector('.interest');
  label.hidden = false;
  form.property.value = `${fromListing.address}, ${fromListing.city}`;
  form.subject.value = `Showing request — ${fromListing.address}`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(form);
  const say = (msg, err) => { note.textContent = msg; note.classList.toggle('error', !!err); };
  if (!f.get('name')?.trim()) return say('Please enter your name.', true);
  if (!form.email.checkValidity() || !f.get('email')) return say('Please enter a valid email address.', true);
  if (form.robot.checked) return say('Please uncheck the box to confirm you are not a robot.', true);
  const subject = f.get('subject')?.trim() || `Website enquiry from ${f.get('name')}`;
  const body = `Name: ${f.get('name')}\nEmail: ${f.get('email')}\nCompany: ${f.get('company') || ''}`
    + (fromListing ? `\nProperty of interest: ${f.get('property')}` : '')
    + `\n\n${f.get('message') || ''}`;
  location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  say('Opening your email app to send the message…');
});
