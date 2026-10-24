// Assets/Scripts/Services/ServiceLocator.cs
using System;
using System.Collections.Generic;

namespace ZedIdler.Services
{
    /// <summary>
    /// Lightweight static service locator used to decouple cross-system dependencies
    /// without forcing a Singleton pattern on every MonoBehaviour. Services register
    /// themselves on awake and unregister on destroy, making the system fully testable
    /// (unit tests can substitute mocks via <see cref="Register{T}"/>).
    /// </summary>
    /// <remarks>
    /// Thread-safety: All access must happen on the Unity main thread.
    /// Lifecycle: Call <see cref="Reset"/> when transitioning between play sessions
    /// (e.g. quitting to main menu) to clear stale references.
    /// </remarks>
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new Dictionary<Type, object>();

        /// <summary>
        /// Fired whenever a service is registered. Useful for late-binding subscribers.
        /// </summary>
        public static event Action<Type, object> OnServiceRegistered;

        /// <summary>
        /// Fired whenever a service is unregistered (e.g. on scene unload).
        /// </summary>
        public static event Action<Type> OnServiceUnregistered;

        /// <summary>
        /// Register a service implementation under interface T.
        /// </summary>
        /// <typeparam name="T">The interface type to register under.</typeparam>
        /// <param name="service">The implementation instance.</param>
        /// <exception cref="ArgumentNullException">Thrown when service is null.</exception>
        public static void Register<T>(T service) where T : class
        {
            if (service == null)
                throw new ArgumentNullException(nameof(service));

            var type = typeof(T);
            _services[type] = service;
            OnServiceRegistered?.Invoke(type, service);
        }

        /// <summary>
        /// Unregister a service. Safe to call even if not registered.
        /// </summary>
        public static void Unregister<T>() where T : class
        {
            var type = typeof(T);
            if (_services.Remove(type))
            {
                OnServiceUnregistered?.Invoke(type);
            }
        }

        /// <summary>
        /// Resolve a registered service. Returns null if not registered — caller is
        /// expected to null-check or use <see cref="TryGet{T}"/>.
        /// </summary>
        public static T Get<T>() where T : class
        {
            return _services.TryGetValue(typeof(T), out var service) ? service as T : null;
        }

        /// <summary>
        /// Try-get pattern. Returns true if the service exists.
        /// </summary>
        public static bool TryGet<T>(out T service) where T : class
        {
            if (_services.TryGetValue(typeof(T), out var raw))
            {
                service = raw as T;
                return service != null;
            }
            service = null;
            return false;
        }

        /// <summary>
        /// True if the service type is registered.
        /// </summary>
        public static bool IsRegistered<T>() where T : class => _services.ContainsKey(typeof(T));

        /// <summary>
        /// Clears all registered services. Call between game sessions or in unit test teardown.
        /// </summary>
        public static void Reset()
        {
            _services.Clear();
        }
    }
}
