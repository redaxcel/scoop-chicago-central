import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShopNotificationRequest {
  business_name: string;
  contact_name: string;
  contact_email: string;
  address: string;
  city: string;
  state: string;
  submission_type: "new_shop" | "shop_update";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ShopNotificationRequest = await req.json();
    console.log("Sending shop notification:", data);

    // Send notification to admin
    const adminEmail = await resend.emails.send({
      from: "Ice Cream Chicago <onboarding@resend.dev>",
      to: ["icecreamchicagodir@gmail.com"],
      subject: `New Shop Submission: ${data.business_name}`,
      html: `
        <h1>New Shop Submission Received</h1>
        <p><strong>Business Name:</strong> ${data.business_name}</p>
        <p><strong>Contact:</strong> ${data.contact_name} (${data.contact_email})</p>
        <p><strong>Location:</strong> ${data.address}, ${data.city}, ${data.state}</p>
        <p><strong>Type:</strong> ${data.submission_type}</p>
        <p>Please review this submission in the admin dashboard.</p>
      `,
    });

    // Send confirmation to submitter
    const userEmail = await resend.emails.send({
      from: "Ice Cream Chicago <onboarding@resend.dev>",
      to: [data.contact_email],
      subject: "Thank you for your submission!",
      html: `
        <h1>Thank you, ${data.contact_name}!</h1>
        <p>We've received your submission for <strong>${data.business_name}</strong>.</p>
        <p>Our team will review your submission and get back to you within 2-3 business days.</p>
        <p>Best regards,<br>The Ice Cream Chicago Team</p>
      `,
    });

    console.log("Emails sent successfully:", { adminEmail, userEmail });

    return new Response(
      JSON.stringify({ success: true, adminEmail, userEmail }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending shop notification:", error);
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
