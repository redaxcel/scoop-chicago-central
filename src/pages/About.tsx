import { Star, MapPin, Users, Award } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-ice-cream.jpg";

const About = () => {
  const stats = [
    { icon: MapPin, number: "50+", label: "Ice Cream Shops Listed" },
    { icon: Users, number: "10K+", label: "Happy Customers Monthly" },
    { icon: Star, number: "4.9", label: "Average Shop Rating" },
    { icon: Award, number: "3", label: "Years Serving Chicago" }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & Ice Cream Enthusiast",
      bio: "Born and raised in Chicago, Sarah has been exploring the city's ice cream scene for over 15 years.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b788?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Mike Chen",
      role: "Head of Partnerships",
      bio: "Mike works directly with ice cream shop owners to ensure accurate listings and special deals.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Emma Rodriguez",
      role: "Community Manager",
      bio: "Emma organizes events and manages our vibrant community of ice cream lovers across Chicago.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="relative container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Ice Cream Chicago
              </h1>
              <p className="text-xl mb-8 text-white/90">
                We're passionate about connecting Chicago's ice cream lovers with the city's 
                most amazing frozen treat destinations. From family-owned parlors to artisanal 
                gelato shops, we celebrate the sweet side of the Windy City.
              </p>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="About Ice Cream Chicago"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-warm animate-gentle-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white p-8 rounded-2xl shadow-mint bounce-hover">
                  <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <Card className="p-6 hover:shadow-warm transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">🍦</div>
                  <h3 className="text-xl font-bold mb-4">Discover & Explore</h3>
                  <p className="text-muted-foreground">
                    Help Chicagoans and visitors discover hidden gems and beloved 
                    ice cream institutions across all neighborhoods.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-warm transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-4">Support Local</h3>
                  <p className="text-muted-foreground">
                    Champion local ice cream shop owners and help them connect 
                    with their community through our platform.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-warm transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">❤️</div>
                  <h3 className="text-xl font-bold mb-4">Build Community</h3>
                  <p className="text-muted-foreground">
                    Create a vibrant community where ice cream enthusiasts can 
                    share experiences, reviews, and sweet memories.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind Chicago's premier ice cream directory
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-warm transition-all duration-300 bounce-hover">
                <CardContent className="p-8">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                  />
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                It all started with a simple question: "Where can I find the best ice cream in Chicago?" 
                As lifelong Chicagoans and self-proclaimed ice cream connoisseurs, we found ourselves 
                constantly searching for new spots, hidden gems, and the perfect scoop for every occasion.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                What began as a personal quest to map every ice cream shop in the city quickly evolved 
                into something bigger. We realized that Chicago's ice cream scene was incredibly diverse 
                and vibrant, but there wasn't a single, comprehensive resource to help people navigate it.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                In 2021, we launched Ice Cream Chicago with a mission to become the definitive guide 
                to frozen treats in the Windy City. Today, we're proud to feature dozens of amazing 
                shops, from century-old institutions to innovative newcomers, each contributing to 
                Chicago's rich culinary landscape.
              </p>
              <p className="text-lg leading-relaxed">
                Whether you're craving traditional Italian gelato, artisanal small-batch ice cream, 
                or classic soft-serve, we're here to help you find your perfect scoop. Because in 
                a city as diverse as Chicago, everyone deserves to discover their new favorite flavor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;