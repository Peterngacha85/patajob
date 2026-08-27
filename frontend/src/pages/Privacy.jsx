import { Shield, Mail, Phone, MessageCircle } from 'lucide-react';

const Section = ({ title, children }) => (
    <div className="mb-10">
        <h2 className="text-xl font-black text-gray-900 mb-3">{title}</h2>
        <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
    </div>
);

const Privacy = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Shield size={32} />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Privacy <span className="text-primary">Policy</span>
                    </h1>
                    <p className="text-gray-500">Effective date: August 28, 2026</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-14">
                    <p className="text-gray-600 leading-relaxed mb-10">
                        PataJob ("we", "us", "our") operates the PataJob website and connects people seeking services
                        ("Users") with independent service providers ("Providers") across Kenya. This policy explains
                        what information we collect, how we use it, and the choices you have.
                    </p>

                    <Section title="1. Information We Collect">
                        <p><strong>Account information:</strong> name, email address, WhatsApp number, and a password (stored securely hashed) when you register directly. If you sign up or log in using Google or Facebook, we receive your name, email address, and profile picture from that provider instead.</p>
                        <p><strong>Profile information:</strong> profile picture and any social media links (Facebook, TikTok, LinkedIn, YouTube) you choose to add.</p>
                        <p><strong>Service activity:</strong> bookings, reviews, ratings, and feedback you submit through the platform.</p>
                        <p><strong>Technical data:</strong> basic log data such as IP address and browser type, collected automatically for security and troubleshooting.</p>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <p>We use your information to create and manage your account, connect Users with Providers, process bookings, send account-related notifications, respond to support requests, and improve the platform's safety and performance.</p>
                    </Section>

                    <Section title="3. Signing In With Google or Facebook">
                        <p>If you choose "Continue with Google" or "Continue with Facebook", we verify your identity token directly with that provider and use the email address they confirm as verified to activate your account immediately, without a separate manual approval step. We only request your basic profile (name, email, profile picture) — we never see or store your Google or Facebook password.</p>
                    </Section>

                    <Section title="4. Sharing Your Information">
                        <p>We do not sell your personal information. We share information only in these cases:</p>
                        <p>• With the other party in a booking — for example, a Provider you book can see your name and WhatsApp number so you can coordinate the job, and vice versa.</p>
                        <p>• With service providers that host or support our platform, including MongoDB Atlas (database hosting), Cloudinary (image storage), and our email delivery provider — solely to operate the service.</p>
                        <p>• When required by law, or to protect the rights, safety, or property of PataJob, our users, or the public.</p>
                    </Section>

                    <Section title="5. Cookies and Local Storage">
                        <p>We use your browser's local storage to keep you signed in (storing your session token) and to remember simple preferences, such as whether you've already seen a particular announcement. We do not use tracking cookies for advertising.</p>
                    </Section>

                    <Section title="6. Data Security">
                        <p>Passwords are hashed before storage and never stored in plain text. We use encrypted connections (HTTPS) between your browser and our servers. No online service can guarantee absolute security, but we take reasonable technical measures to protect your data.</p>
                    </Section>

                    <Section title="7. Your Rights">
                        <p>You can review and update most of your information at any time from your dashboard. To request a copy of your data, ask us to correct it, or ask us to delete your account, contact us using the details below.</p>
                    </Section>

                    <Section title="8. Children's Privacy">
                        <p>PataJob is intended for users aged 18 and above. We do not knowingly collect information from children.</p>
                    </Section>

                    <Section title="9. Changes to This Policy">
                        <p>We may update this policy from time to time. If we make material changes, we will update the effective date above and, where appropriate, notify you.</p>
                    </Section>

                    <Section title="10. Contact Us">
                        <p>If you have questions about this policy or your data, reach out to us:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <a href="tel:0739090811" className="flex items-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl transition font-medium">
                                <Phone size={18} />
                                0739090811
                            </a>
                            <a href="mailto:Info@patajob.co.ke" className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 rounded-xl transition font-medium">
                                <Mail size={18} />
                                Info@patajob.co.ke
                            </a>
                            <a href="https://wa.me/254794108498" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-500 hover:text-white text-green-600 rounded-xl transition font-medium">
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
