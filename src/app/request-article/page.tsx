import { TopicForm } from "@/components/shared/topic-form";
import { RequestHero } from "@/components/requests/request-hero";
import { RequestSidebar } from "@/components/requests/request-sidebar";
import { RequestFaqs } from "@/components/requests/request-faqs";
import { RequestNewsletter } from "@/components/requests/request-newsletter";
import { metadata } from "@/lib/seo/metadata";
import { pageSeo } from "@/lib/content/site-copy";
import { publicApiUrl } from "@/lib/config";
import styles from "@/components/requests/request.module.css";

export const generateMetadata = () =>
  metadata(
    pageSeo.request.title,
    pageSeo.request.description,
    "/request-article",
  );

export default function RequestArticle() {
  return (
    <div className={styles.page} data-request-page>
      <RequestHero />
      <div className={styles.shell}>
        <div className={styles.layout}>
          <TopicForm apiUrl={publicApiUrl} />
          <RequestSidebar />
        </div>
        <RequestFaqs />
        <RequestNewsletter />
      </div>
    </div>
  );
}
