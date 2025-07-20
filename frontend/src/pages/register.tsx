import React, { useState } from "react";

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    voornaam: "",
    achternaam: "",
    email: "",
    password: "",
    password_confirmation: "",
    leeftijd: "",
    aanhef: "meneer",
    bedrijfsnaam: "",
    aantal_werknemers: "",
    kvk_nummer: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.voornaam || !form.achternaam || !form.email || !form.password || !form.password_confirmation) {
        setError("Vul alle verplichte velden in");
        return;
      }
      if (form.password !== form.password_confirmation) {
        setError("Wachtwoorden komen niet overeen");
        return;
      }
      if (form.password.length < 6) {
        setError("Wachtwoord moet minimaal 6 karakters bevatten");
        return;
      }
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setForm({
        voornaam: "",
        achternaam: "",
        email: "",
        password: "",
        password_confirmation: "",
        leeftijd: "",
        aanhef: "meneer",
        bedrijfsnaam: "",
        aantal_werknemers: "",
        kvk_nummer: "",
      });
      setStep(1);
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
      }, 2000);
    } catch (err) {
      setError("Kon geen verbinding maken met de server.");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Persoonlijke gegevens";
      case 2: return "Bedrijfsinformatie";
      case 3: return "Bevestiging";
      default: return "Account aanmaken";
    }
  };

  const getStepDescription = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Vul je basisgegevens in";
      case 2: return "Voeg bedrijfsdetails toe (optioneel)";
      case 3: return "Controleer en voltooi je registratie";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-2 py-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-28 -right-28 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-28 -left-28 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step > stepNumber ? '✓' : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                    step > stepNumber ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow p-4 md:p-6 space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Account aanmaken
            </h1>
            <h2 className="text-base text-white font-medium">{getStepTitle(step)}</h2>
            <p className="text-slate-400 text-xs">{getStepDescription(step)}</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 backdrop-blur-sm text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 backdrop-blur-sm text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-green-300 font-medium">Registratie gelukt! Je wordt doorgestuurd...</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-3 animate-in slide-in-from-right duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Aanhef</label>
                    <select
                      name="aanhef"
                      value={form.aanhef}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    >
                      <option value="meneer">Meneer</option>
                      <option value="mevrouw">Mevrouw</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Leeftijd</label>
                    <input
                      name="leeftijd"
                      type="number"
                      placeholder="Bijv. 25"
                      value={form.leeftijd}
                      onChange={handleChange}
                      min="16"
                      max="120"
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Voornaam *</label>
                    <input
                      name="voornaam"
                      type="text"
                      placeholder="Je voornaam"
                      value={form.voornaam}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Achternaam *</label>
                    <input
                      name="achternaam"
                      type="text"
                      placeholder="Je achternaam"
                      value={form.achternaam}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">E-mailadres *</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Wachtwoord *</label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Minimaal 6 karakters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Bevestig wachtwoord *</label>
                    <input
                      name="password_confirmation"
                      type="password"
                      placeholder="Herhaal je wachtwoord"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-3 animate-in slide-in-from-right duration-200">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Bedrijfsinformatie</h3>
                  <p className="text-slate-400 text-xs">Deze velden zijn optioneel maar helpen ons je beter te begrijpen</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bedrijfsnaam</label>
                  <input
                    name="bedrijfsnaam"
                    type="text"
                    placeholder="Naam van je bedrijf"
                    value={form.bedrijfsnaam}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Aantal werknemers</label>
                  <input
                    name="aantal_werknemers"
                    type="number"
                    placeholder="Bijv. 10"
                    value={form.aantal_werknemers}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-3 animate-in slide-in-from-right duration-200">
                <div className="text-center p-3 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/20">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Bijna klaar!</h3>
                  <p className="text-slate-400 text-xs">Voeg eventueel nog je KVK-nummer toe en maak je account aan</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">KVK-nummer</label>
                  <input
                    name="kvk_nummer"
                    type="text"
                    placeholder="Bijv. 12345678"
                    value={form.kvk_nummer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 text-xs">
                  <h4 className="text-white font-medium mb-1">Overzicht van je gegevens</h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p><span className="font-medium">Naam:</span> {form.aanhef} {form.voornaam} {form.achternaam}</p>
                    <p><span className="font-medium">Email:</span> {form.email}</p>
                    {form.leeftijd && <p><span className="font-medium">Leeftijd:</span> {form.leeftijd}</p>}
                    {form.bedrijfsnaam && <p><span className="font-medium">Bedrijf:</span> {form.bedrijfsnaam}</p>}
                    {form.aantal_werknemers && <p><span className="font-medium">Werknemers:</span> {form.aantal_werknemers}</p>}
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-700/20 rounded-lg p-2 border border-slate-600/20">
                  <p className="flex items-start">
                    <span className="text-cyan-400 mr-1">ℹ</span>
                    Door je account aan te maken ga je akkoord met onze voorwaarden en privacybeleid. Velden gemarkeerd met * zijn verplicht.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mt-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center px-4 py-2 text-slate-300 hover:text-cyan-400 transition-all duration-200 font-medium group text-xs"
                >
                  <svg className="w-3 h-3 mr-1 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Terug
                </button>
              ) : (
                <div />
              )}

              <div className="flex space-x-2">
                {step < 3 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg group text-xs"
                  >
                    Volgende
                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg text-xs"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registreren...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Account aanmaken
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
