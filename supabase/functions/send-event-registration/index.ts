import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventRegistrationRequest {
  name: string;
  email: string;
  event_title: string;
  event_date: string;
  event_location: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EventRegistrationRequest = await req.json();
    console.log("Sending event registration confirmation:", data);

    const emailResponse = await resend.emails.send({
      from: "Ice Cream Chicago <onboarding@resend.dev>",
      to: [data.email],
      subject: `Registration Confirmed: ${data.event_title}`,
      html: `
        <h1>You're Registered, ${data.name}!</h1>
        <p>Your registration for <strong>${data.event_title}</strong> has been confirmed.</p>
        <p><strong>Date:</strong> ${new Date(data.event_date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${data.event_location}</p>
        <p>We look forward to seeing you there!</p>
        <p>Best regards,<br>The Ice Cream Chicago Team</p>
      `,
    });

    console.log("Registration email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending registration email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
