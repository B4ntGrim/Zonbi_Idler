// Assets/Scripts/Services/ContractCatalogExtension.cs
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>Catalog adapter for Contract assets. Companion to CatalogService.</summary>
    [DisallowMultipleComponent]
    public sealed class ContractCatalogExtension : MonoBehaviour, IContractCatalogProvider
    {
        [SerializeField] private Contract[] contracts;
        [SerializeField] private string resourcesRoot = "Catalogs";

        private readonly Dictionary<string, Contract> _byId = new Dictionary<string, Contract>();

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (contracts == null || contracts.Length == 0)
                contracts = Resources.LoadAll<Contract>(resourcesRoot);
            _byId.Clear();
            foreach (var c in contracts ?? System.Array.Empty<Contract>())
                if (c != null && !string.IsNullOrEmpty(c.ContractId)) _byId[c.ContractId] = c;
            ServiceLocator.Register<IContractCatalogProvider>(this);
            if (_byId.Count == 0)
                Debug.LogWarning("[ContractCatalogExtension] No Contract assets. Run ZedIdler → Seed Contracts.");
        }

        private void OnDestroy() => ServiceLocator.Unregister<IContractCatalogProvider>();

        public Contract GetContract(string contractId) =>
            !string.IsNullOrEmpty(contractId) && _byId.TryGetValue(contractId, out var c) ? c : null;

        public IReadOnlyList<Contract> GetAllContracts() => contracts ?? System.Array.Empty<Contract>();
    }
}
