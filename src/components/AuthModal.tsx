import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message = "Vous devez vous connecter pour publier une alerte." }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const validatePhone = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return cleanPhone.length === 10;
  };

  const convertPhoneToEmail = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `${cleanPhone}@trafkin.com`;
  };

  const resetForm = () => {
    setEmail('');
    setPhone('');
    setPassword('');
    setFullName('');
    setUsername('');
    setLoading(false);
    setAuthMethod('email');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let loginEmail = email;
      
      if (authMethod === 'phone') {
        if (!validatePhone(phone)) {
          toast({
            title: "Numéro invalide",
            description: "Le numéro de téléphone doit contenir exactement 10 chiffres",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        loginEmail = convertPhoneToEmail(phone);
      }
      
      const { error } = await signIn(loginEmail, password);
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté"
        });
        handleClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let signupEmail = email;
      
      if (authMethod === 'phone') {
        if (!validatePhone(phone)) {
          toast({
            title: "Numéro invalide",
            description: "Le numéro de téléphone doit contenir exactement 10 chiffres",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        signupEmail = convertPhoneToEmail(phone);
      }
      
      const { error } = await signUp(signupEmail, password, {
        full_name: fullName,
        username: username,
        role: 'user'
      });
      
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte"
        });
        handleClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connexion requise</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={authMethod === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthMethod('email')}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={authMethod === 'phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthMethod('phone')}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                Téléphone
              </Button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {authMethod === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="modal-signin-email">Email</Label>
                  <Input
                    id="modal-signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="modal-signin-phone">Numéro de téléphone (10 chiffres)</Label>
                  <Input
                    id="modal-signin-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0123456789"
                    maxLength={10}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="modal-signin-password">Mot de passe</Label>
                <Input
                  id="modal-signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={authMethod === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthMethod('email')}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={authMethod === 'phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthMethod('phone')}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                Téléphone
              </Button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-signup-fullname">Nom complet</Label>
                <Input
                  id="modal-signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-signup-username">Nom d'utilisateur</Label>
                <Input
                  id="modal-signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              {authMethod === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="modal-signup-email">Email</Label>
                  <Input
                    id="modal-signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="modal-signup-phone">Numéro de téléphone (10 chiffres)</Label>
                  <Input
                    id="modal-signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0123456789"
                    maxLength={10}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="modal-signup-password">Mot de passe</Label>
                <Input
                  id="modal-signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Inscription...' : "S'inscrire"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}