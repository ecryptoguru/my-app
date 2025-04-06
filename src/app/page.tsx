import { Button } from "@/components/ui/button";
import { BarChart3, FileUp, ArrowRight, Package, Users, LineChart, TrendingUp, Truck, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Business Assistant</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          AI-powered analytics and insights to help your business grow
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard/demand-forecasting">
            <Button size="lg" className="text-lg">
              <BarChart3 className="mr-2 h-5 w-5" /> Get Started
            </Button>
          </Link>
          <Link href="/upload-demo">
            <Button variant="outline" size="lg" className="text-lg">
              <FileUp className="mr-2 h-5 w-5" /> File Upload Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Business Intelligence Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Link href="/dashboard/demand-forecasting" className="no-underline">
              <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
                <LineChart className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Demand Forecasting</h3>
                <p className="text-muted-foreground mb-4">Predict future sales and demand with AI-powered time series analysis</p>
                <div className="flex items-center text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link href="/dashboard/inventory-management" className="no-underline">
              <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
                <Package className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
                <p className="text-muted-foreground mb-4">Optimize stock levels and reduce costs with intelligent inventory analysis</p>
                <div className="flex items-center text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link href="/dashboard/customer-segmentation" className="no-underline">
              <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
                <Users className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Customer Segmentation</h3>
                <p className="text-muted-foreground mb-4">Identify key customer groups and tailor your marketing strategies</p>
                <div className="flex items-center text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Feature 4 */}
            <Link href="/dashboard/pricing-strategies" className="no-underline">
              <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
                <TrendingUp className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Pricing Strategies</h3>
                <p className="text-muted-foreground mb-4">Optimize your pricing for maximum profit and market share</p>
                <div className="flex items-center text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Feature 5 */}
            <Link href="/dashboard/supplier-performance" className="no-underline">
              <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
                <Truck className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Supplier Performance</h3>
                <p className="text-muted-foreground mb-4">Evaluate and improve your supply chain efficiency</p>
                <div className="flex items-center text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Feature 6 */}
            <Link href="/dashboard/business-reporting" className="no-underline">
              <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
                <FileText className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Business Reporting</h3>
                <p className="text-muted-foreground mb-4">Generate comprehensive reports with actionable insights</p>
                <div className="flex items-center text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your business?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get started with our AI-powered business assistant today
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="text-lg">
              Sign In <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
