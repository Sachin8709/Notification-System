from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q

class CaseInsensitiveModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get('email')
        
        if not username:
            return None
            
        try:
            # Check for case-insensitive username or email
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # Fallback if multiple users exist with same case-insensitive username
            user = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username)).order_by('id').first()
            if user and user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None
