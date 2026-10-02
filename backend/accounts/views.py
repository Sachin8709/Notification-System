from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Profile
from notifications.dispatcher import fire_trigger

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Log user in
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)

        # Get the profile to return in response, but never update it during login
        profile, _ = Profile.objects.get_or_create(user=user)

        # Fire login notification trigger!
        dispatch_results = fire_trigger("login", user)

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            'profile': {
                'phone_number': profile.phone_number,
                'onesignal_subscription_id': profile.onesignal_subscription_id,
            },
            'dispatch_results': dispatch_results
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        
        # Fire logout notification trigger BEFORE logging out
        dispatch_results = fire_trigger("logout", user)

        # Delete token if using token auth
        try:
            if hasattr(user, 'auth_token'):
                user.auth_token.delete()
        except Exception:
            pass

        logout(request)

        return Response({
            'message': 'Successfully logged out.',
            'dispatch_results': dispatch_results
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone_number = request.data.get('phone_number', '')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username__iexact=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if email and User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.phone_number = phone_number
        profile.save()

        token, _ = Token.objects.get_or_create(user=user)

        # Optionally fire login trigger upon register
        dispatch_results = fire_trigger("login", user)

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            'profile': {
                'phone_number': profile.phone_number,
                'onesignal_subscription_id': profile.onesignal_subscription_id,
            },
            'dispatch_results': dispatch_results
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            'profile': {
                'phone_number': profile.phone_number,
                'onesignal_subscription_id': profile.onesignal_subscription_id,
            }
        })

    def patch(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        if 'email' in request.data:
            user.email = request.data['email']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        user.save()

        if 'phone_number' in request.data:
            profile.phone_number = request.data['phone_number']
        if 'onesignal_subscription_id' in request.data:
            profile.onesignal_subscription_id = request.data['onesignal_subscription_id']
        profile.save()

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            'profile': {
                'phone_number': profile.phone_number,
                'onesignal_subscription_id': profile.onesignal_subscription_id,
            }
        })


