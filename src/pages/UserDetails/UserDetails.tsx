import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function UserDetails() {
  return (
    <>
      <PageMeta
        title="aizah hospitality"
        description="aizah hospitality"
      />
      <PageBreadcrumb pageTitle="User Details" />
      <div className="space-y-6">
        <ComponentCard title="">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
