import { useEffect, useState } from "react";
import { getBusinessHours } from "../services/businessHoursService";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(time) {
  if (!time) return "";

  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function ContactPage() {
  const [hours, setHours] = useState([]);

  useEffect(() => {
    async function loadHours() {
      try {
        const data = await getBusinessHours();
        setHours(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadHours();
  }, []);

  return (
    <section className="section page-section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Come see us</p>
          <h1>Contact and Location</h1>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <h2>Restaurant Information</h2>
            <p>123 Restaurant Street</p>
            <p>California, USA</p>
            <p>(555) 555-5555</p>
            <p>chidi@firstbornservices.com</p>
          </div>

          <div className="contact-card">
            <h2>Hours</h2>

            {hours.map((day) => (
              <p key={day.dayOfWeek}>
                <strong>{dayNames[day.dayOfWeek]}:</strong>{" "}
                {day.isClosed
                  ? "Closed"
                  : `${formatTime(day.openTime)}–${formatTime(day.closeTime)}`}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
