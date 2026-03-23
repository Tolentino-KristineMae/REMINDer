import axios from 'axios';

const VAPID_PUBLIC_KEY = 'BCz3o6KaDp4INPcrrHkJdYk6S8e_12UnGcfknJZ3BhE0F1vgTTMQ1HSRwE6eCvScJjju91oDd_51NPIclg0eeGY';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeUser = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if user is already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission not granted for notifications');
    }

    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    
    // Store subscription on backend
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    await axios.post(`${apiBaseUrl}/push-subscriptions`, subscription.toJSON(), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log('User is subscribed to push notifications');
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe user:', error);
    throw error;
  }
};

export const unsubscribeUser = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      await axios.delete(`${apiBaseUrl}/push-subscriptions`, {
        data: { endpoint: subscription.endpoint },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('User is unsubscribed');
    }
  } catch (error) {
    console.error('Failed to unsubscribe user:', error);
  }
};
