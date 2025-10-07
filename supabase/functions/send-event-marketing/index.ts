import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recipient {
  name: string;
  email: string;
}

interface EmailMarketingRequest {
  recipients: Recipient[];
  subject: string;
  content: string;
  event_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EmailMarketingRequest = await req.json();
    console.log(`Sending marketing emails to ${data.recipients.length} recipients`);

    const emailPromises = data.recipients.map(async (recipient) => {
      // Replace {name} placeholder with actual name
      const personalizedContent = data.content.replace(/\{name\}/g, recipient.name);

      return resend.emails.send({
        from: "Ice Cream Chicago <onboarding@resend.dev>",
        to: [recipient.email],
        subject: data.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Ice Cream Chicago</h1>
            </div>
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${personalizedContent}</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                <p>You're receiving this email because you registered for one of our events.</p>
                <p>Ice Cream Chicago | Discover the best ice cream in Chicago</p>
              </div>
            </div>
          </div>
        `,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Email marketing complete: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        total: data.recipients.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending marketing emails:", error);
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