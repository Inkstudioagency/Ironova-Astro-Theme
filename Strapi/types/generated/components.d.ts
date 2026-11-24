import type { Schema, Struct } from '@strapi/strapi';

export interface BlogSection extends Struct.ComponentSchema {
  collectionName: 'components_blog_sections';
  info: {
    description: 'Article section: its table-of-contents label and rich-text body.';
    displayName: 'Article Section';
    icon: 'file';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    tocTitle: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLabel extends Struct.ComponentSchema {
  collectionName: 'components_shared_labels';
  info: {
    description: 'A single short label (scope items, highlights).';
    displayName: 'Label';
    icon: 'hashtag';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLabelValue extends Struct.ComponentSchema {
  collectionName: 'components_shared_label_values';
  info: {
    description: 'Key/value pair (specifications, statistics).';
    displayName: 'Label & Value';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Page title and description used for search engines and social cards.';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
  };
}

export interface SharedTitleText extends Struct.ComponentSchema {
  collectionName: 'components_shared_title_texts';
  info: {
    description: 'A short heading with supporting text (features, steps, skills, challenges).';
    displayName: 'Title & Text';
    icon: 'layer';
  };
  attributes: {
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'blog.section': BlogSection;
      'shared.label': SharedLabel;
      'shared.label-value': SharedLabelValue;
      'shared.seo': SharedSeo;
      'shared.title-text': SharedTitleText;
    }
  }
}
