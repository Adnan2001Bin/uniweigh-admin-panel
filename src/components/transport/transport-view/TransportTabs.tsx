interface TransportTabsProps {
  activeTab: "carters" | "drivers" | "vehicles";
  onChange: (tab: "carters" | "drivers" | "vehicles") => void;
}

export default function TransportTabs({ activeTab, onChange }: TransportTabsProps) {
  const tabs: { id: "carters" | "drivers" | "vehicles"; label: string }[] = [
    { id: "carters", label: "Carriers" },
    { id: "drivers", label: "Drivers" },
    { id: "vehicles", label: "Vehicles" }
  ];

  return (
    <div className="flex border-b border-gray-150 text-sm bg-white p-1 rounded-lg border max-w-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-1.5 text-center font-bold rounded-md transition ${
            activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
